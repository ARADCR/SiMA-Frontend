Get-ChildItem -Path "c:\Users\otero\SiMA\SiMA-Frontend\src\app\modules" -Recurse -Filter *.scss | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content -Raw $file
    $content = $content -replace 'width:\s*\d+px;', 'width: 100%;' `
                         -replace 'height:\s*\d+px;', 'height: auto;' `
                         -replace 'max-width:\s*\d+px;', 'max-width: 100%;'
    Set-Content -Path $file -Value $content
}
