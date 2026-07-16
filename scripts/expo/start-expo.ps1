$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = Join-Path $root "runtime\node.exe"
$server = Join-Path $root "app\server.js"
$pidFile = Join-Path $root "expo-server.pid"
$stdout = Join-Path $root "expo-server.out.log"
$stderr = Join-Path $root "expo-server.err.log"

if (!(Test-Path -LiteralPath $node)) { throw "No se encontro el runtime portable: $node" }
if (!(Test-Path -LiteralPath $server)) { throw "No se encontro la aplicacion empaquetada: $server" }

if (Test-Path -LiteralPath $pidFile) {
  $oldPid = [int](Get-Content -LiteralPath $pidFile -Raw)
  $oldProcess = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
  if ($oldProcess) { Stop-Process -Id $oldPid -Force }
  Remove-Item -LiteralPath $pidFile -Force
}

$port = $null
foreach ($candidate in 3210..3220) {
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidate)
    $listener.Start()
    $listener.Stop()
    $port = $candidate
    break
  } catch {}
}
if (!$port) { throw "No hay un puerto local libre entre 3210 y 3220." }

$edgeCandidates = @(
  "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$edge = $edgeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (!$edge) { throw "Microsoft Edge no esta instalado. Consulte LEEME.md para el inicio manual." }

$env:RUTA_EXPO_OFFLINE = "true"
$env:HOSTNAME = "127.0.0.1"
$env:PORT = [string]$port
$process = Start-Process -FilePath $node -ArgumentList $server -WorkingDirectory (Join-Path $root "app") -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ascii

try {
  $health = "http://127.0.0.1:$port/api/expo/health"
  $ready = $false
  foreach ($attempt in 1..60) {
    if ($process.HasExited) { throw "El servidor se detuvo. Revise expo-server.err.log." }
    try {
      $response = Invoke-RestMethod -Uri $health -TimeoutSec 2
      if ($response.ok) { $ready = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  if (!$ready) { throw "La aplicacion no supero el control de salud en 30 segundos." }

  $profile = Join-Path $root "edge-profile"
  $edgeProcess = Start-Process -FilePath $edge -ArgumentList "--app=http://127.0.0.1:$port","--start-fullscreen","--user-data-dir=$profile","--no-first-run" -PassThru
  Wait-Process -Id $edgeProcess.Id
} finally {
  if (!$process.HasExited) { Stop-Process -Id $process.Id -Force }
  if (Test-Path -LiteralPath $pidFile) { Remove-Item -LiteralPath $pidFile -Force }
}
