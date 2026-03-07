Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Obtiene la ruta de la carpeta actual del script
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
' Ruta completa al ejecutable (asegúrate que el nombre sea exacto)
exePath = strPath & "\ArtDentPrint.exe"

' Verifica si el archivo existe antes de intentar correrlo
If fso.FileExists(exePath) Then
    WshShell.Run """" & exePath & """", 0, False
Else
    MsgBox "No se encontró el archivo: " & exePath, 16, "Error ArtDent"
End If

Set WshShell = Nothing
Set fso = Nothing