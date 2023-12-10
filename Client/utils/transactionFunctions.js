const solanaWeb3 = require('@solana/web3.js');
const bs58 = require('bs58');
const { TREASURY_WALLET_PUBLIC_KEY, TREASURY_WALLET_PRIVATE_KEY } = require('../config.json');

const treasuryWalletPublicKey = TREASURY_WALLET_PUBLIC_KEY;
const treasuryWalletPrivateKey = TREASURY_WALLET_PRIVATE_KEY;
const Solana = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));

let cachedBlockhash = null;
let lastBlockhashTime = 0;
const BLOCKHASH_CACHE_TIME = 30 * 1000; // 30 seconds cache time

async function getBlockhash() {
    const currentTime = new Date().getTime();
    if (!cachedBlockhash || currentTime - lastBlockhashTime > BLOCKHASH_CACHE_TIME) {
        const { blockhash } = await Solana.getLatestBlockhash();
        cachedBlockhash = blockhash;
        lastBlockhashTime = currentTime;
    }
    return cachedBlockhash;
}

// Function for sending a transaction to the winner's wallet
async function sendTransactionToWinner(winnerWalletAddress, amount) {
    const treasuryKeypair = solanaWeb3.Keypair.fromSecretKey(bs58.decode(treasuryWalletPrivateKey));
    const winnerPublicKey = new solanaWeb3.PublicKey(winnerWalletAddress);

    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: treasuryKeypair.publicKey,
            toPubkey: winnerPublicKey,
            lamports: solanaWeb3.LAMPORTS_PER_SOL * amount
        })
    );

    transaction.recentBlockhash = await getBlockhash();

    transaction.sign(treasuryKeypair);

    const signature = await solanaWeb3.sendAndConfirmTransaction(Solana, transaction, [treasuryKeypair]);
    return signature;
}

// Function for sending a transaction to the treasury wallet
async function sendTransactionToTreasury(decryptedPrivateKeyBuffer, amount) {
    const userKeypair = solanaWeb3.Keypair.fromSecretKey(decryptedPrivateKeyBuffer);
    const treasuryPublicKey = new solanaWeb3.PublicKey(treasuryWalletPublicKey);

    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: userKeypair.publicKey,
            toPubkey: treasuryPublicKey,
            lamports: solanaWeb3.LAMPORTS_PER_SOL * amount
        })
    );

    transaction.recentBlockhash = await getBlockhash();

    transaction.sign(userKeypair);

    const signature = await solanaWeb3.sendAndConfirmTransaction(Solana, transaction, [userKeypair]);
    return signature;
}

module.exports = { sendTransactionToWinner, sendTransactionToTreasury };