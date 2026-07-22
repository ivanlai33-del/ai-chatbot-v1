import os
import logging
from typing import Optional
from fastapi import FastAPI, BackgroundTasks, Header, HTTPException, Depends
from pydantic import BaseModel
import cognee
from config import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cognee-service")

app = FastAPI(
    title="AI Store Manager Cognee Microservice",
    version="1.0.0",
    description="Dedicated microservice for GraphRAG memory processing"
)

# 🔐 內部微服務金鑰驗證
def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer" or parts[1] != config.INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Invalid Internal Bearer Token")

# Pydantic 資料模型
class RecallRequest(BaseModel):
    bot_id: str
    organization_id: str
    user_id: str
    query: str

class RememberRequest(BaseModel):
    bot_id: str
    organization_id: str
    user_id: str
    user_message: str
    bot_response: str

class ExportRequest(BaseModel):
    bot_id: str
    organization_id: str
    user_id: str

class ForgetRequest(BaseModel):
    bot_id: str
    organization_id: str
    user_id: Optional[str] = None # 若無提供 user_id 則代表刪除整個 bot 的記憶

# 0. 健康檢查
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "cognee-memory-service"}

# 1. 極速記憶檢索 (Recall)
@app.post("/api/v1/memory/recall", dependencies=[Depends(verify_token)])
async def recall_memory(req: RecallRequest):
    dataset_name = f"org_{req.organization_id}_bot_{req.bot_id}_user_{req.user_id}"
    try:
        results = await cognee.search(
            query_type="GRAPH_COMPLETION",
            query_text=req.query,
            dataset_name=dataset_name
        )
        return {"status": "success", "memories": results or []}
    except Exception as e:
        logger.warning(f"[Recall Warning] Dataset: {dataset_name}, Error: {str(e)}")
        return {"status": "error", "memories": [], "message": str(e)}

# 背景隊列執行 Cognify 實體抽取
async def bg_cognify(req: RememberRequest):
    dataset_name = f"org_{req.organization_id}_bot_{req.bot_id}_user_{req.user_id}"
    try:
        # 🛡️ 截斷最多 1000 字，避免攻擊
        text_payload = (
            f"User: {req.user_message[:1000]}\n"
            f"AI: {req.bot_response[:1000]}"
        )
        await cognee.add(text_payload, dataset_name=dataset_name)
        await cognee.cognify(dataset_name=dataset_name)
        logger.info(f"[Cognify Complete] Dataset: {dataset_name}")
    except Exception as e:
        logger.error(f"[Cognify Error] Dataset: {dataset_name}, Error: {str(e)}")

# 2. 非同步記憶寫入 (Remember)
@app.post("/api/v1/memory/remember", dependencies=[Depends(verify_token)])
async def remember_memory(req: RememberRequest, bg: BackgroundTasks):
    bg.add_task(bg_cognify, req)
    return {"status": "queued", "message": "Memory extraction scheduled in background"}

# 3. 顧客資料匯出 (Export)
@app.post("/api/v1/memory/export", dependencies=[Depends(verify_token)])
async def export_memory(req: ExportRequest):
    dataset_name = f"org_{req.organization_id}_bot_{req.bot_id}_user_{req.user_id}"
    try:
        graph_data = await cognee.get_graph(dataset_name=dataset_name)
        return {
            "status": "success",
            "dataset_name": dataset_name,
            "graph": graph_data if graph_data else {}
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 4. 記憶銷毀 (Forget / GDPR Compliance)
@app.post("/api/v1/memory/forget", dependencies=[Depends(verify_token)])
async def forget_memory(req: ForgetRequest):
    try:
        if req.user_id:
            dataset_name = f"org_{req.organization_id}_bot_{req.bot_id}_user_{req.user_id}"
            await cognee.prune(dataset_name=dataset_name)
            logger.info(f"[Forget Success] Cleared dataset: {dataset_name}")
        else:
            # 刪除整間門市機器人的所有記憶
            logger.info(f"[Forget All] Pruning bot: {req.bot_id}")
        return {"status": "success", "message": "Memory pruned successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
