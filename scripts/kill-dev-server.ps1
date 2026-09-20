# Detiene procesos node.exe de "next dev" que pertenecen a este proyecto.
# Coincidencia por ruta del proyecto en la linea de comandos, NO mata node.exe en general.
$projectPath = Split-Path -Parent $PSScriptRoot

Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -like "*$projectPath*" -and
        $_.CommandLine -match "next(\s|\|/).*dev|dev.*next"
    } |
    ForEach-Object {
        try {
            Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop
            Write-Output "Detenido proceso dev server (PID $($_.ProcessId))"
        } catch {
            # Proceso ya terminado o sin permisos; no es fatal.
        }
    }
