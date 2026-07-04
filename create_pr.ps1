$origin = git config --get remote.origin.url
if (-not $origin) { throw "No remote origin URL found" }
$regex = [regex]"https://([^:]+):([^@]+)@github.com/([^/]+)/([^/]+)(?:\.git)?$"
$m = $regex.Match($origin)
if (-not $m.Success) { throw "Unable to parse origin URL: $origin" }
$token = $m.Groups[2].Value
$owner = $m.Groups[3].Value
$repo = $m.Groups[4].Value
$branch = git branch --show-current
$branch = $branch.Trim()
$headers = @{ Authorization = "token $token"; Accept = 'application/vnd.github+json'; 'User-Agent' = 'github-api-script' }
$baseUrl = "https://api.github.com/repos/$owner/$repo"
$existing = Invoke-RestMethod -Uri "$baseUrl/pulls?head=${owner}:${branch}&base=main&state=open" -Headers $headers -Method Get
if ($existing.Count -gt 0) {
    Write-Output $existing[0].html_url
    exit 0
}
$body = @{
    title = 'fix: correct Vercel env config for NEXT_PUBLIC_BASE_URL to string'
    head = $branch
    base = 'main'
    body = 'This PR fixes Vercel deployment validation by setting NEXT_PUBLIC_BASE_URL as a plain string in vercel.json, which resolves the invalid env type error. Local build has been verified.'
}
$response = Invoke-RestMethod -Uri "$baseUrl/pulls" -Headers $headers -Method Post -Body ($body | ConvertTo-Json -Depth 4)
Write-Output $response.html_url
