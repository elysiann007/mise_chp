$pdfPath = "C:\Users\emirf\Downloads\Cafehookah poster.pdf"
$outPath = "E:\mise_chp\mise-frontend\public\campaign-poster.jpg"

$app = New-Object -ComObject AcroExch.App
$doc = New-Object -ComObject AcroExch.PDDoc

$doc.Open($pdfPath) | Out-Null

$jso = $doc.GetJSObject()
$jso.SaveAs($outPath, "com.adobe.acrobat.jpeg")

$doc.Close() | Out-Null
$app.Exit() | Out-Null

Write-Host "Done: $outPath"
$sz = (Get-Item $outPath -ErrorAction SilentlyContinue).Length
if ($sz) { Write-Host "Size: $([math]::Round($sz/1KB)) KB" }
