$body = '{"correo":"admin@sima.com","password":"Admin1234"}'
$loginResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
$token = $loginResp.data.token
$headers = @{ Authorization = "Bearer $token" }

# Fetch reportes to see the new one  
$reportesResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/dashboard/reportes' -Method GET -Headers $headers
Write-Host "Historial count: $($reportesResp.historial.Count)"
$reportesResp.historial | ConvertTo-Json -Depth 5

if ($reportesResp.historial -and $reportesResp.historial.Count -gt 0) {
    $reportId = $reportesResp.historial[0].id
    Write-Host "`nDownloading PDF for report ID: $reportId"
    try {
        Invoke-WebRequest -Uri "http://localhost:8080/api/dashboard/reportes/$reportId/download" -Method GET -Headers $headers -OutFile "test_report.pdf"
        $fileInfo = Get-Item "test_report.pdf"
        Write-Host "PDF saved! Size: $($fileInfo.Length) bytes"
    } catch {
        Write-Host "Download Error: $($_.Exception.Message)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody"
    }
}
