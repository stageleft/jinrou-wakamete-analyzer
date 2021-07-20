# Powershell script to create jinrou-wakamete-analyzer.xpi

Remove-Item 'jinrou-wakamete-analyzer.xpi'
Remove-Item  'jinrou-wakamete-analyzer.zip'

Compress-Archive -Path 'src\*' -DestinationPath 'jinrou-wakamete-analyzer.zip'

Rename-Item 'jinrou-wakamete-analyzer.zip' 'jinrou-wakamete-analyzer.xpi'
