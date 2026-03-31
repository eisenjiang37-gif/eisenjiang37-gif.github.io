# Notes on tensor.permute and view: What I Got Wrong for Too Long

These are working notes, not a tutorial. I kept making the same mistake and eventually decided to write it down.

---

## The core confusion

I treated `permute` and `view` as interchangeable ways to reshape a tensor. They are not.

- **`view`** reinterprets the raw memory layout without moving any data. It only works when the tensor is *contiguous* — i.e. elements are stored in C-order row-major with no gaps.
- **`permute`** reorders the *axes*, which changes the logical shape but does **not** rearrange memory. The result is almost always non-contiguous.

The problem: after a `permute`, calling `view` raises a RuntimeError because the underlying storage is no longer contiguous. The fix is to call `.contiguous()` first (which copies data into a fresh contiguous buffer), then `view`.

```python
x = torch.randn(2, 3, 4)

# permute reorders axes: (2,3,4) -> (2,4,3)
x_t = x.permute(0, 2, 1)
print(x_t.is_contiguous())  # False

# this fails:
# x_t.view(2, 12)  -> RuntimeError

# this works:
x_t.contiguous().view(2, 12)

# or just use reshape, which handles this automatically:
x_t.reshape(2, 12)
```

---

## When reshape saves you (and when it doesn't)

`reshape` is the safe default — it calls `view` if contiguous, otherwise allocates and copies. For most forward-pass code this is fine.

Where it matters: inside tight training loops, an unexpected `.contiguous()` call inside `reshape` allocates new memory every step. On large spatiotemporal tensors (video models, radar spectrograms) this adds up. Profile before assuming it is free.

---

## The spatiotemporal case

Working on action recognition, tensors frequently have shape `(B, T, C, H, W)`. A typical operation:

```python
# Merge time and batch for a 2D conv:
x = x.permute(0, 2, 1, 3, 4)   # (B, C, T, H, W)
x = x.reshape(B * C, T, H * W)  # flatten spatial
```

After the `permute` the tensor is non-contiguous. `reshape` handles it, but if you need `view` (e.g. for in-place ops or when you want to be explicit), add `.contiguous()`:

```python
x = x.permute(0, 2, 1, 3, 4).contiguous().view(B * C, T, H * W)
```

---

## Rule of thumb

| Operation | Moves data? | Safe after permute? |
|-----------|-------------|---------------------|
| `view`    | No          | No (raises error)   |
| `reshape` | Sometimes   | Yes                 |
| `.contiguous().view` | Yes (copy) | Yes     |

Use `reshape` unless you need the guarantee that no copy happens, in which case check `.is_contiguous()` first.

---

*Last updated: March 2026*
