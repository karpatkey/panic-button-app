#!/bin/bash

# GitHub repository and PR API endpoint
# GITHUB_REPO="karpatkey/panic-button-app"
PR_NUMBER=$1
# GITHUB_API_URL="https://api.github.com/repos/${GITHUB_REPO}/commits/${GITHUB_SHA}/pulls"

# DOCKER_TAG=$(echo $1 | cut -c1-7)

# Extract PR number from the GitHub API response
# PR_NUMBER=$(curl -s ${GITHUB_API_URL} | jq -r '.[0].number')


# Apply the temporary Kubernetes deployment
kubectl delete deployment -n panic-pr-review develop-panic-button-app-${PR_NUMBER}

kubectl delete svc -n panic-pr-review develop-panic-button-app-${PR_NUMBER}

kubectl delete ing -n panic-pr-review develop-panic-button-app-ingress-${PR_NUMBER}