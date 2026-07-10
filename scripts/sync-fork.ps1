[CmdletBinding(SupportsShouldProcess = $true)]
param(
	[string]$OriginRemote = 'origin',
	[string]$UpstreamRemote = 'upstream',
	[string]$UpstreamBranch = 'stable',
	[string]$VendorBranch = 'vendor/ckeditor5',
	[switch]$Push,
	[switch]$SkipCleanCheck
)

# Mirrors the upstream CKEditor branch into a non-default vendor branch used by SkyCMS.
#
# Branch roles:
# - vendor/ckeditor5: upstream-tracking mirror branch.
# - skycms/main: SkyCMS customization and deployment branch.
#
# Workflow:
# 1) Fetch the configured upstream branch.
# 2) Reset the vendor branch to exactly match upstream.
# 3) Optionally push the mirrored vendor branch to origin.
#
# Promotion into skycms/main is intentionally handled via pull request review.
#
# Examples:
# - Preview actions only:
#   pwsh ./scripts/sync-fork.ps1 -WhatIf
# - Mirror upstream/stable into vendor/ckeditor5 and push:
#   pwsh ./scripts/sync-fork.ps1 -Push
# - Preview against an already-dirty working tree:
#   pwsh ./scripts/sync-fork.ps1 -SkipCleanCheck -WhatIf

$ErrorActionPreference = 'Stop'

function Invoke-Git {
	param(
		[Parameter(Mandatory = $true)]
		[string[]]$Args,
		[switch]$MutatesRepository,
		[string]$Operation = 'git command'
	)

	$commandText = "git $($Args -join ' ')"

	if ($MutatesRepository -and -not $PSCmdlet.ShouldProcess($Operation, $commandText)) {
		return
	}

	Write-Host "> $commandText" -ForegroundColor Cyan
	& git @Args
	if ($LASTEXITCODE -ne 0) {
		throw "Git command failed: $commandText"
	}
}

function Get-GitOutput {
	param(
		[Parameter(Mandatory = $true)]
		[string[]]$Args
	)

	$output = & git @Args
	if ($LASTEXITCODE -ne 0) {
		throw "Git command failed: git $($Args -join ' ')"
	}

	return ($output | Out-String).Trim()
}

function Test-GitRemoteBranch {
	param(
		[Parameter(Mandatory = $true)]
		[string]$RemoteName,
		[Parameter(Mandatory = $true)]
		[string]$BranchName
	)

	& git ls-remote --exit-code --heads $RemoteName $BranchName | Out-Null
	return $LASTEXITCODE -eq 0
}

function Test-GitRef {
	param(
		[Parameter(Mandatory = $true)]
		[string]$RefName
	)

	& git show-ref --verify --quiet $RefName
	return $LASTEXITCODE -eq 0
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Push-Location $repoRoot

try {
	if (-not $SkipCleanCheck) {
		$status = Get-GitOutput -Args @('status', '--porcelain')
		if ($status) {
			throw 'Working tree is not clean. Commit/stash your changes before running this script.'
		}
	}

	$currentBranch = Get-GitOutput -Args @('branch', '--show-current')
	$upstreamRef = "$UpstreamRemote/$UpstreamBranch"

	$remoteNames = Get-GitOutput -Args @('remote')
	if (-not ($remoteNames -split "`r?`n" | Where-Object { $_ -eq $UpstreamRemote })) {
		throw "Remote '$UpstreamRemote' is not configured. Add it before running this script."
	}

	Write-Host "Fetching $UpstreamRemote/$UpstreamBranch..." -ForegroundColor Yellow
	Invoke-Git -Args @('fetch', $UpstreamRemote, $UpstreamBranch)

	if (-not (Test-GitRef -RefName "refs/remotes/$upstreamRef")) {
		throw "Upstream ref '$upstreamRef' was not found after fetch."
	}

	Write-Host "Refreshing vendor branch $VendorBranch from $upstreamRef..." -ForegroundColor Yellow
	Invoke-Git -Args @('checkout', '-B', $VendorBranch, $upstreamRef) -MutatesRepository -Operation 'reset vendor branch to upstream'

	if ($Push) {
		Write-Host "Pushing mirrored vendor branch to $OriginRemote/$VendorBranch..." -ForegroundColor Yellow

		if (Test-GitRemoteBranch -RemoteName $OriginRemote -BranchName $VendorBranch) {
			Invoke-Git -Args @('push', '--force-with-lease', $OriginRemote, "HEAD:refs/heads/$VendorBranch") -MutatesRepository -Operation 'push mirrored vendor branch'
		}
		else {
			Invoke-Git -Args @('push', '--set-upstream', $OriginRemote, "HEAD:refs/heads/$VendorBranch") -MutatesRepository -Operation 'create mirrored vendor branch on origin'
		}
	}

	if ($currentBranch -and $currentBranch -ne $VendorBranch) {
		Write-Host "Restoring original branch $currentBranch..." -ForegroundColor Yellow
		Invoke-Git -Args @('checkout', $currentBranch) -MutatesRepository -Operation 'restore original branch'
	}

	Write-Host 'Vendor sync complete.' -ForegroundColor Green
}
finally {
	Pop-Location
}
