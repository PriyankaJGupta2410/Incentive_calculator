import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

########################## IMPORT ROUTES #################
from routers import organization_router
from routers import user_router
from routers import upload_router
from routers import incentive_calculator_router

################### Declar Routes ####################
app.include_router(organization_router.organizationrouter)
app.include_router(user_router.userRouter)
app.include_router(upload_router.upload_router)
app.include_router(incentive_calculator_router.calculator_router)

@app.get("/")
async def index():
   return {"message": "Hello World"}

if __name__ == "__main__":
   uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)