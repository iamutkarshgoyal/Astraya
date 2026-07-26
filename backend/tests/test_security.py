from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hash_verification() -> None:
    hashed_password = get_password_hash("Hello@12345")

    assert verify_password("Hello@12345", hashed_password)
    assert not verify_password("wrong-password", hashed_password)


def test_token_type_validation() -> None:
    access_token = create_access_token(subject="1", role="admin")
    refresh_token = create_refresh_token(subject="1")

    access_payload = decode_token(access_token, expected_type="access")

    assert access_payload is not None
    assert access_payload["sub"] == "1"
    assert access_payload["role"] == "admin"
    assert decode_token(refresh_token, expected_type="access") is None
