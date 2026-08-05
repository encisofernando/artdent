<#
    Manda un archivo de bytes crudos (ESC/POS) directo al spooler de Windows
    en modo RAW, usando la misma API Win32 (winspool.drv: OpenPrinter/
    StartDocPrinter/WritePrinter) que usa cualquier software de tickets
    profesional. Evita por completo el renderizado de página (GDI) que hace
    que impresoras térmicas conectadas por USB terminen saliendo con zoom
    de A4 cuando se les manda un pageSize personalizado vía webContents.print().

    No requiere módulos nativos de Node ni compilar nada — PowerShell ya
    viene en cualquier Windows y puede invocar la API de Win32 directo.
#>
param(
    [Parameter(Mandatory=$true)][string]$PrinterName,
    [Parameter(Mandatory=$true)][string]$FilePath
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class ArtDentRawPrinter {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }

    [DllImport("winspool.drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
    public static extern bool OpenPrinter(string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In] DOCINFOA di);

    [DllImport("winspool.drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true)]
    public static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, int dwCount, out int dwWritten);

    public static bool SendBytes(string printerName, byte[] bytes, out string error) {
        error = null;
        IntPtr hPrinter;
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "ArtDent Ticket";
        di.pDataType = "RAW";

        if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero)) {
            error = "OpenPrinter fallo (codigo " + Marshal.GetLastWin32Error() + ")";
            return false;
        }

        try {
            if (!StartDocPrinter(hPrinter, 1, di)) {
                error = "StartDocPrinter fallo (codigo " + Marshal.GetLastWin32Error() + ")";
                return false;
            }
            if (!StartPagePrinter(hPrinter)) {
                error = "StartPagePrinter fallo (codigo " + Marshal.GetLastWin32Error() + ")";
                EndDocPrinter(hPrinter);
                return false;
            }

            int written;
            bool ok = WritePrinter(hPrinter, bytes, bytes.Length, out written);

            EndPagePrinter(hPrinter);
            EndDocPrinter(hPrinter);

            if (!ok || written != bytes.Length) {
                error = "WritePrinter escribio " + written + "/" + bytes.Length + " bytes";
                return false;
            }

            return true;
        } finally {
            ClosePrinter(hPrinter);
        }
    }
}
"@

$bytes = [System.IO.File]::ReadAllBytes($FilePath)
$errorMsg = $null
$ok = [ArtDentRawPrinter]::SendBytes($PrinterName, $bytes, [ref]$errorMsg)

if ($ok) {
    Write-Output "OK"
    exit 0
} else {
    [Console]::Error.WriteLine($errorMsg)
    exit 1
}
