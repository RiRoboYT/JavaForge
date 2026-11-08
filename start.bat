@echo off
REM JavaForge - double-click to start JavaForge on this computer.
REM Uses Python if installed, otherwise Java (including the Java that comes with BlueJ).
cd /d "%~dp0"
title JavaForge

python --version >nul 2>&1
if not errorlevel 1 (
  python server.py
  goto done
)
py -3 --version >nul 2>&1
if not errorlevel 1 (
  py -3 server.py
  goto done
)
java -version >nul 2>&1
if not errorlevel 1 (
  java JavaForgeServer.java
  goto done
)
for %%J in ("%ProgramFiles%\BlueJ\jdk\bin\java.exe" "%ProgramFiles(x86)%\BlueJ\jdk\bin\java.exe" "%LocalAppData%\Programs\BlueJ\jdk\bin\java.exe") do (
  if exist %%J (
    %%J JavaForgeServer.java
    goto done
  )
)

echo.
echo  JavaForge needs Python or Java to run on this computer.
echo  Install Python from https://www.python.org/downloads/
echo  (tick "Add python.exe to PATH" during setup), then double-click start.bat again.
echo.

:done
pause
