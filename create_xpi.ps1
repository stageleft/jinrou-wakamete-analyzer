# Powershell script to create jinrou-wakamete-analyzer.xpi

if (Test-Path 'jinrou-wakamete-analyzer.xpi' ){
    Remove-Item 'jinrou-wakamete-analyzer.xpi'
}
if (Test-Path 'jinrou-wakamete-analyzer.zip' ){
    Remove-Item  'jinrou-wakamete-analyzer.zip'
}

Compress-Archive -Path 'src\*' -DestinationPath 'jinrou-wakamete-analyzer.zip'

Rename-Item 'jinrou-wakamete-analyzer.zip' 'jinrou-wakamete-analyzer.xpi'
