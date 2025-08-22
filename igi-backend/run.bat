@echo off
echo === Python Project Setup ===

:: Check if venv already exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv

    echo Activating virtual environment...
    call venv\Scripts\activate.bat

    echo Upgrading pip and tools...
    python -m pip install -U pip setuptools wheel

    echo Installing requirements...
    if exist requirements.txt (
        pip install -r requirements.txt
    )
    pip install uvicorn "uvicorn[standard]" fastapi pyserial opencv-python-headless onnxruntime

    echo Freezing environment...
    pip freeze > requirements.txt
) else (
    echo Virtual environment already exists.
    echo Activating...
    call venv\Scripts\activate.bat
)

echo Starting server...
uvicorn main:app --reload --reload-dir .

pause