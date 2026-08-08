$ErrorActionPreference = "Stop"

$OutputFile = "..\src\data\baseStats.json"
$StatsDict = @{}

Write-Host "Fetching Base Stats and Growth Rates for 386 Pokemon..."

for ($i = 1; $i -le 386; $i++) {
    Write-Host "Fetching #$i..." -NoNewline
    
    # Fetch Stats
    $pkmnRes = Invoke-RestMethod -Uri "https://pokeapi.co/api/v2/pokemon/$i/"
    
    # Fetch Species for Growth Rate
    $speciesRes = Invoke-RestMethod -Uri "https://pokeapi.co/api/v2/pokemon-species/$i/"
    
    $hp = ($pkmnRes.stats | Where-Object { $_.stat.name -eq 'hp' }).base_stat
    $atk = ($pkmnRes.stats | Where-Object { $_.stat.name -eq 'attack' }).base_stat
    $def = ($pkmnRes.stats | Where-Object { $_.stat.name -eq 'defense' }).base_stat
    $spa = ($pkmnRes.stats | Where-Object { $_.stat.name -eq 'special-attack' }).base_stat
    $spd = ($pkmnRes.stats | Where-Object { $_.stat.name -eq 'special-defense' }).base_stat
    $spe = ($pkmnRes.stats | Where-Object { $_.stat.name -eq 'speed' }).base_stat
    
    $growthRate = $speciesRes.growth_rate.name

    $StatsDict[$i.ToString()] = @{
        hp = $hp
        atk = $atk
        def = $def
        spa = $spa
        spd = $spd
        spe = $spe
        growthRate = $growthRate
    }
    
    Write-Host " Done."
}

$StatsDict | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding utf8
Write-Host "Successfully generated $OutputFile"
