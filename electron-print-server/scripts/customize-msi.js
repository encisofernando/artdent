const fs = require('fs');
const path = require('path');

function escapeXmlAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function assetPath(fileName) {
  return escapeXmlAttribute(path.resolve(__dirname, '..', 'build', 'installer', fileName));
}

function replaceAll(xml, search, replacement) {
  return xml.split(search).join(replacement);
}

module.exports = async function customizeMsi(projectFile) {
  const bannerBmp = assetPath('banner.bmp');
  const dialogBmp = assetPath('dialog.bmp');

  for (const file of [bannerBmp, dialogBmp]) {
    const unescaped = file.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    if (!fs.existsSync(unescaped)) {
      throw new Error(`Missing MSI branding asset: ${unescaped}`);
    }
  }

  let xml = fs.readFileSync(projectFile, 'utf8');

  xml = xml
    .replace('Language="1033"', 'Language="3082"')
    .replace(
      'Message="Windows 7 and above is required"',
      'Message="Se requiere Windows 7 o superior"',
    )
    .replace(
      'DowngradeErrorMessage=\'A newer version of "[ProductName]" is already installed.\'',
      'DowngradeErrorMessage=\'Ya hay una versión más nueva de "[ProductName]" instalada.\'',
    )
    .replace(
      /<Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOXTEXT" Value="[^"]+"\/>/,
      '<Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOXTEXT" Value="Abrir ArtDent Print Service"/>',
    );

  xml = xml
    .replace(
      /<Property Id="ApplicationFolderName" Value="[^"]+"\/>/,
      '<Property Id="ApplicationFolderName" Value="Print Service"/>',
    )
    .replace(
      /<Directory Id="APPLICATIONFOLDER" Name="[^"]+"\/>/,
      '<Directory Id="APPLICATIONFOLDER" Name="Print Service"/>',
    );

  xml = replaceAll(
    xml,
    'Dialog="WelcomeDlg" Control="Next" Event="NewDialog" Value="InstallScopeDlg"',
    'Dialog="WelcomeDlg" Control="Next" Event="NewDialog" Value="InstallDirDlg"',
  );
  xml = replaceAll(
    xml,
    'Dialog="InstallDirDlg" Control="Back" Event="NewDialog" Value="InstallScopeDlg"',
    'Dialog="InstallDirDlg" Control="Back" Event="NewDialog" Value="WelcomeDlg"',
  );
  xml = xml.replace(
    /\s*<Publish Dialog="VerifyReadyDlg" Control="Back" Event="NewDialog" Value="InstallScopeDlg" Order="2">NOT Installed<\/Publish>/,
    '',
  );

  const propertiesMarker = '<Property Id="DISABLEADVTSHORTCUTS" Value="1"/>';
  const brandedProperties = `${propertiesMarker}
    <Property Id="ARPCONTACT" Value="ArtDent"/>
    <Property Id="ARPHELPLINK" Value="https://artdent.com.ar"/>
    <Property Id="ARPURLINFOABOUT" Value="https://artdent.com.ar"/>
    <Property Id="ARPCOMMENTS" Value="Servidor local de impresión para ArtDent CRM"/>
    <WixVariable Id="WixUIBannerBmp" Value="${bannerBmp}"/>
    <WixVariable Id="WixUIDialogBmp" Value="${dialogBmp}"/>`;

  if (!xml.includes('WixUIBannerBmp')) {
    xml = xml.replace(propertiesMarker, brandedProperties);
  }

  fs.writeFileSync(projectFile, xml, 'utf8');
};
