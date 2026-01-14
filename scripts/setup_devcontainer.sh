# Copy the Docker image's modules into the shadowed bind mount
# (workspace must be /workspaces/Tasktix for GitHub Codespaces;
# must shadow bind mount to avoid overwriting the host's node_modules
# for local dev containers)
cp -a /app/node_modules/* /workspaces/Tasktix/node_modules

# Copy the user's signing key if it exists (will only be the case locally)
if [ -f /root/.ssh/git_signing ]; then
  git config user.signingkey /root/.ssh/git_signing.pub
fi

# Make a local copy of the env file (NOTE: must ensure this matches the Codespaces secrets)
cp -a ./.env.example ./.env

# Prepare database
npm run prisma:generate
