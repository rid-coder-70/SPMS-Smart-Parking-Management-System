# run_all.ps1
# Script to launch both the SPMS Backend and Frontend simultaneously.
# It opens two separate command windows so you can see the logs for both.

Write-Host "Starting SPMS Backend (Spring Boot)..."
Start-Process cmd -ArgumentList "/k cd backend && mvnw.cmd spring-boot:run" -WindowStyle Normal

Write-Host "Starting SPMS Frontend (Vite)..."
Start-Process cmd -ArgumentList "/k cd frontend && npm install && npm run dev" -WindowStyle Normal

Write-Host "Both servers are starting up!"
Write-Host "Backend will be available at http://localhost:8080"
Write-Host "Frontend will be available at http://localhost:5173"
