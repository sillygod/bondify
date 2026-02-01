from typing import List
from pydantic import BaseModel

class ModelInfo(BaseModel):
    id: str
    name: str
    description: str | None = None

class ModelsListResponse(BaseModel):
    models: List[ModelInfo]
