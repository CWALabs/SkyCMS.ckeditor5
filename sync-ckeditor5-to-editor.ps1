[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$CkeditorRepoPath,
    [string]$EditorCkeditorPath,
    [switch]$SkipBuild,
    [switch]$SkipLicenseUpdate
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

$repoRootCandidates = @(
    $scriptRoot,
    (Join-Path $scriptRoot '..')
)

$repoRoot = $null

foreach ($candidate in $repoRootCandidates) {
    if (-not (Test-Path $candidate)) {
        continue
    }

    $resolvedCandidate = Resolve-Path $candidate -ErrorAction Stop | Select-Object -ExpandProperty Path
    $distPath = Join-Path $resolvedCandidate 'packages\ckeditor5\dist'

    if (Test-Path $distPath) {
        $repoRoot = $resolvedCandidate
        break
    }
}

if (-not $repoRoot) {
    throw 'Could not resolve ckeditor5 repository root. Expected a folder containing packages\ckeditor5\dist.'
}

if (-not $CkeditorRepoPath) {
    $CkeditorRepoPath = $repoRoot
}

if (-not $EditorCkeditorPath) {
    $inRepoEditorPath = Join-Path $repoRoot 'Editor\wwwroot\lib\ckeditor'
    $siblingSkyCmsEditorPath = Join-Path (Split-Path $repoRoot -Parent) 'SkyCMS\Editor\wwwroot\lib\ckeditor'
    $grandParentSkyCmsEditorPath = Join-Path (Split-Path (Split-Path $repoRoot -Parent) -Parent) 'SkyCMS\Editor\wwwroot\lib\ckeditor'

    if (Test-Path $inRepoEditorPath) {
        $EditorCkeditorPath = $inRepoEditorPath
    }
    elseif (Test-Path $siblingSkyCmsEditorPath) {
        $EditorCkeditorPath = $siblingSkyCmsEditorPath
    }
    elseif (Test-Path $grandParentSkyCmsEditorPath) {
        $EditorCkeditorPath = $grandParentSkyCmsEditorPath
    }
    else {
        throw "Could not find SkyCMS editor assets path. Checked: $inRepoEditorPath, $siblingSkyCmsEditorPath, and $grandParentSkyCmsEditorPath"
    }
}

$resolvedCkeditorRepoPath = Resolve-Path $CkeditorRepoPath -ErrorAction Stop | Select-Object -ExpandProperty Path

if (-not (Test-Path $EditorCkeditorPath)) {
    throw "Editor CKEditor path was not found: $EditorCkeditorPath"
}

$sourceDistPath = Join-Path $resolvedCkeditorRepoPath 'packages\ckeditor5\dist'
$sourceBrowserPath = Join-Path $sourceDistPath 'browser'
$sourceLicensePath = Join-Path $resolvedCkeditorRepoPath 'packages\ckeditor5\LICENSE.md'

$topLevelFiles = @(
    'ckeditor5-content.css',
    'ckeditor5-editor.css',
    'ckeditor5.css',
    'ckeditor5.css.map',
    'ckeditor5.js',
    'ckeditor5.js.map'
)

$browserFiles = @(
    'ckeditor5.umd.js',
    'ckeditor5.umd.js.map'
)

function Assert-PathExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    if (-not (Test-Path $Path)) {
        throw "$Description was not found: $Path"
    }
}

function Copy-FileWithDirectory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Source,

        [Parameter(Mandatory = $true)]
        [string]$Destination
    )

    $destinationDirectory = Split-Path -Parent $Destination

    if (-not (Test-Path $destinationDirectory)) {
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    }

    if ($PSCmdlet.ShouldProcess($Destination, "Copy file from $Source")) {
        Copy-Item -Path $Source -Destination $Destination -Force
    }
}

Write-Host 'SkyCMS CKEditor sync' -ForegroundColor Cyan
Write-Host "CKEditor repo: $resolvedCkeditorRepoPath"
Write-Host "Editor asset path: $EditorCkeditorPath"
Write-Host ''

if (-not $SkipBuild) {
    $pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue

    if (-not $pnpmCommand) {
        throw 'pnpm is required to build the sibling CKEditor repository. Install pnpm or rerun with -SkipBuild.'
    }

    if ($PSCmdlet.ShouldProcess($resolvedCkeditorRepoPath, 'Run pnpm build')) {
        Push-Location $resolvedCkeditorRepoPath

        try {
            & $pnpmCommand.Source 'build'

            if ($LASTEXITCODE -ne 0) {
                throw "pnpm build failed with exit code $LASTEXITCODE"
            }
        }
        finally {
            Pop-Location
        }
    }
}

Assert-PathExists -Path $sourceDistPath -Description 'CKEditor dist directory'
Assert-PathExists -Path $sourceBrowserPath -Description 'CKEditor browser dist directory'

foreach ($fileName in $topLevelFiles) {
    $sourcePath = Join-Path $sourceDistPath $fileName
    $destinationPath = Join-Path $EditorCkeditorPath $fileName

    Assert-PathExists -Path $sourcePath -Description "Required CKEditor artifact '$fileName'"
    Copy-FileWithDirectory -Source $sourcePath -Destination $destinationPath
}

foreach ($fileName in $browserFiles) {
    $sourcePath = Join-Path $sourceBrowserPath $fileName
    $destinationPath = Join-Path $EditorCkeditorPath $fileName

    Assert-PathExists -Path $sourcePath -Description "Required CKEditor browser artifact '$fileName'"
    Copy-FileWithDirectory -Source $sourcePath -Destination $destinationPath
}

$translationsSourcePath = Join-Path $sourceDistPath 'translations'
$translationsDestinationPath = Join-Path $EditorCkeditorPath 'translations'

Assert-PathExists -Path $translationsSourcePath -Description 'CKEditor translations directory'

if ($PSCmdlet.ShouldProcess($translationsDestinationPath, "Copy translations directory from $translationsSourcePath")) {
    Copy-Item -Path $translationsSourcePath -Destination $translationsDestinationPath -Recurse -Force
}

if (-not $SkipLicenseUpdate) {
    Assert-PathExists -Path $sourceLicensePath -Description 'CKEditor license file'
    Copy-FileWithDirectory -Source $sourceLicensePath -Destination (Join-Path $EditorCkeditorPath 'LICENSE-ckeditor5.md')
}

Write-Host ''
Write-Host 'Sync completed.' -ForegroundColor Green
Write-Host 'Run this script with -WhatIf to preview the copy operations without changing files.'