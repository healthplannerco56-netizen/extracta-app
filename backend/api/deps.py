from fastapi import Header, HTTPException

async def require_auth(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid auth header")
    return authorization.split(" ")[1]
