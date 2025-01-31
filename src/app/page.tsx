"use client"
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IMPLEMENTATION_ABI } from '@/lib/abi';

const ProxyContractCaller = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txHash, setTxHash] = useState('');
  const [data, setData] = useState('');
  const [proxyAddress, setProxyAddress] = useState('');

  const TARGET_ADDRESS = '0x0BD4078E15EeA5ac22a0e6f215C27286920FDA1A';

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another web3 wallet');
      }

      setLoading(true);
      setError('');
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if we're on Base network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x2105') { // Base mainnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }],
          });
        } catch (switchError: unknown) {
          // Handle chain switch error
          if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
              }]
            });
          } else {
            throw switchError;
          }
        }
      }

      setSuccess('Wallet connected successfully!');
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to connect wallet'
      );
    } finally {
      setLoading(false);
    }
  };

  const callProxyContract = async () => {
    try {
      if (!proxyAddress || !ethers.isAddress(proxyAddress)) {
        throw new Error('Please enter a valid proxy address');
      }
      if (!data.trim()) {
        throw new Error('Please enter data');
      }
      if (!data.startsWith('0x')) {
        throw new Error('Data must start with 0x');
      }
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or another web3 wallet');
      }

      setLoading(true);
      setError('');
      setSuccess('');
      setTxHash('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Create contract instance using the static ABI
      const contract = new ethers.Contract(proxyAddress, IMPLEMENTATION_ABI, signer);

      // First try to estimate gas to get a better error message
      try {
        await contract.execute.estimateGas(TARGET_ADDRESS, 0, data, {
          value: 0
        });
      } catch (estimateErr: any) {
        if (estimateErr?.data) {
          // If there's custom error data, try to decode it
          throw new Error(`Contract error: ${estimateErr.data}`);
        }
        throw estimateErr;
      }

      // Call the execute function with hardcoded values
      const tx = await contract.execute(TARGET_ADDRESS, 0, data, {
        value: 0
      });
      setTxHash(tx.hash);
      
      await tx.wait();
      setSuccess('Transaction successful!');
    } catch (err: unknown) {
      console.error('Detailed error:', err); // This will help with debugging
      setError(err instanceof Error ? err.message : 'Failed to call contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold">Definitive $VVV Airdrop Claim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="proxyAddress" className="text-sm font-semibold text-gray-900">
                Account Address
              </label>
              <input
                id="proxyAddress"
                type="text"
                value={proxyAddress}
                onChange={(e) => setProxyAddress(e.target.value)}
                placeholder="Enter your Definitive Base vault address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="data" className="text-sm font-semibold text-gray-900">
                Claim Data
              </label>
              <input
                id="data"
                type="text"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="Enter your call data (starts with 0x)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                disabled={loading}
              />
              <p className="text-sm text-gray-600 font-medium">
                Make sure your claim data starts with 0x and matches the format provided by Definitive
              </p>
            </div>

            <button
              onClick={connectWallet}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg
                        hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500
                        transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                        font-semibold shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
            
            <button
              onClick={callProxyContract}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg
                        hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500
                        transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                        font-semibold shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Claiming...
                </span>
              ) : (
                'Claim Airdrop'
              )}
            </button>
          </div>

          {error && (
            <Alert variant="destructive" className="animate-fadeIn">
              <AlertDescription className="flex items-center gap-2 text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 animate-fadeIn">
              <AlertDescription className="flex items-center gap-2 text-green-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </AlertDescription>
            </Alert>
          )}

          {txHash && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fadeIn">
              <p className="font-semibold text-gray-900 mb-2">Transaction Hash:</p>
              <a 
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-900 break-all transition-colors duration-200"
              >
                {txHash}
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProxyContractCaller;