#!/usr/bin/env bash
# Deploy AgentRegistry contract to Stellar testnet.
# Usage: ./scripts/deploy.sh [source_key_alias]
#
# Prerequisites:
#   - stellar CLI installed (v25+)
#   - Testnet network configured: stellar network add testnet ...
#   - Source key funded: stellar keys fund <alias> --network testnet

set -euo pipefail

SOURCE="${1:-orbit-deployer}"
NETWORK="testnet"

echo "==> Building contracts..."
cd "$(dirname "$0")/.."
stellar contract build

WASM_PATH="target/wasm32v1-none/release/agent_registry.wasm"

if [ ! -f "$WASM_PATH" ]; then
    echo "ERROR: WASM not found at $WASM_PATH"
    exit 1
fi

echo "==> Deploying AgentRegistry to $NETWORK..."
CONTRACT_ID=$(stellar contract deploy \
    --wasm "$WASM_PATH" \
    --source "$SOURCE" \
    --network "$NETWORK" \
    --alias agent-registry 2>&1 | tail -1)

echo "==> Contract deployed: $CONTRACT_ID"

echo "==> Initializing contract..."
stellar contract invoke \
    --id agent-registry \
    --source "$SOURCE" \
    --network "$NETWORK" \
    -- initialize --admin "$SOURCE"

echo "==> Verifying deployment..."
COUNT=$(stellar contract invoke \
    --id agent-registry \
    --source "$SOURCE" \
    --network "$NETWORK" \
    -- agent_count 2>&1 | tail -1)

echo "==> Agent count: $COUNT"
echo ""
echo "Deployment complete."
echo "  Contract ID:   $CONTRACT_ID"
echo "  Network:       $NETWORK"
echo "  Admin:         $SOURCE"
echo "  Agent count:   $COUNT"
echo ""
echo "To register an agent:"
echo "  stellar contract invoke \\"
echo "    --id agent-registry \\"
echo "    --source $SOURCE \\"
echo "    --network $NETWORK \\"
echo '    -- register_agent \\'
echo "    --owner $SOURCE \\"
echo '    --name '"'"'"My Agent"'"'"' \\'
echo '    --description '"'"'"Agent description"'"'"' \\'
echo '    --metadata_uri '"'"'"https://example.com/agent.json"'"'"''
