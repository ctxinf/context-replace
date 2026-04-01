# GitHub Actions Workflow for Docker

This project uses GitHub Actions to automatically build Docker images and create releases.

## Workflow Triggers

The workflow is triggered by:
- Push to `main`/`master` branch
- New tags (e.g., `v1.0.0`)
- Pull requests to `main`/`master`

## Jobs

### 1. Test Job
- Runs TypeScript compilation check (`npm run tsc`)
- Builds the project in development mode (`npm run build:dev`)
- Ensures code quality before building Docker images

### 2. Build and Push Job
- Builds multi-platform Docker images (linux/amd64, linux/arm64)
- Pushes to GitHub Container Registry (ghcr.io)
- Uses GitHub Actions cache for faster builds
- Generates build attestations for security

### 3. Release Job
- Creates GitHub releases for version tags
- Generates automatic changelog from git commits
- Includes Docker image pull instructions

## Docker Image Tags

- `latest` - Latest build from main branch
- `v1.0.0` - Specific version tags
- `main` - Latest build from main branch
- `pr-123` - Pull request builds

## Usage

### Pull the Docker Image
```bash
# Pull latest version
docker pull ghcr.io/your-username/context-replace-web:latest

# Pull specific version
docker pull ghcr.io/your-username/context-replace-web:v1.0.0
```

### Run the Container
```bash
docker run -p 8080:80 ghcr.io/your-username/context-replace-web:latest
```

## Environment Variables

The workflow uses these environment variables:
- `REGISTRY`: Set to `ghcr.io` (GitHub Container Registry)
- `IMAGE_NAME`: Set to `${{ github.repository }}`

## Required Permissions

The workflow requires these permissions:
- `contents: read` - To checkout code
- `packages: write` - To push Docker images
- `attestations: write` - To generate build attestations
- `id-token: write` - For security attestations

## Notes

- The workflow skips Docker push for pull requests
- Releases are only created for version tags (starting with `v`)
- Build cache is shared between workflow runs for faster builds
- Multi-platform support ensures compatibility with different architectures