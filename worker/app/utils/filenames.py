from pathlib import Path


def sanitize_filename(filename: str | None, empty_fallback: str = "document.pdf") -> str:
    """Return a safe ASCII filename, or empty_fallback when no safe characters remain."""
    raw_name = Path((filename or "").replace("\\", "/")).name
    safe_chars: list[str] = []

    for char in raw_name:
        code = ord(char)
        if char in {'"', "'", "/", "\\"} or code < 32 or code == 127 or code > 126:
            continue
        safe_chars.append(char)

    safe_name = "".join(safe_chars).strip(" .")
    if not safe_name:
        return empty_fallback

    return safe_name


def output_filename(
    filename: str | None,
    extension: str,
    *,
    prefix: str = "",
    fallback_stem: str = "document",
) -> str:
    safe_name = sanitize_filename(filename, f"{fallback_stem}.{extension}")
    stem = safe_name.rsplit(".", 1)[0] if "." in safe_name else safe_name
    stem = stem or fallback_stem
    return f"{prefix}{stem}.{extension}"
