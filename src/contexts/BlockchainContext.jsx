import React from "react";
import { ethers } from "ethers";

export const BlockchainContext = React.createContext({
  currentAccount: null,
  provider: null,
  chainId: null
});

const BlockchainContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = React.useState(null);
  const [provider, setProvider] = React.useState(null);
  const [chainId, setChainId] = React.useState(null);


  /**
   * 方法一
   */
  React.useEffect(() => {
    /*
     * 使用 window.ethereum 來透過 Matamask 來取得錢包地址
     * 參考資料: https://docs.metamask.io/guide/rpc-api.html
     * 並且將錢包地址設定在上方事先寫好的 currentAccount state
     * 加分項目1: 使用 window.ethereum 偵測換錢包地址事件，並且切換 currentAccount 值
     * 加分項目2: 使用 window.ethereum 偵測目前的鏈是否為 Rinkeby，如果不是，則透過 window.ethereum 跳出換鏈提示
     * 提示: Rinkeby chain ID 為 0x4
     */

    // const onAccounts = accounts => {
    //   const [_account] = accounts;
    //   setCurrentAccount(_account); 
    // }

    // window.ethereum
    // .request({ method: 'eth_requestAccounts' })
    // .then(onAccounts);

    // window.ethereum
    // .on("accountsChanged", onAccounts);

    // return () => {
    //   window.ethereum
    //   .removeListener("accountsChanged", onAccounts);
    // }

  }, []);

  React.useEffect(() => {
    /*
     * 使用 ethers.js
     * 透過 Web3Provider 將 window.ethereum 做為參數建立一個新的 web3 provider
     * 並將這個新的 web3 provider 設定成 provider 的 state
     */

    // if (currentAccount) {
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   setProvider(provider)
    // }
  }, [currentAccount]);



  /**
   * 方法二
   */

  /**********************************************************/
  /* Handle chain (network) and chainChanged (per EIP-1193) */
  /**********************************************************/

  window.ethereum
  .request({ method: 'eth_chainId' })
  .then(handleChainChanged)

  window.ethereum
  .on('chainChanged', () => window.location.reload());

  function handleChainChanged(_chainId) {
    const _id = parseInt(_chainId, 16)
    _id === 4 ? setChainId(_id) : switchChainId(4)
  }

  const switchChainId = async (_chainId) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${Number(_chainId).toString(16)}` }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x4',
                chainName: '...',
                rpcUrls: ['https://...'] /* ... */,
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  }

  /***********************************************************/
  /* Handle user accounts and accountsChanged (per EIP-1193) */
  /***********************************************************/

  // window.ethereum
  // .request({ method: 'eth_accounts' })
  // .then(handleAccountsChanged)
  // .catch((err) => {
  //   // Some unexpected error.
  //   // For backwards compatibility reasons, if no accounts are available,
  //   // eth_accounts will return an empty array.
  //   console.error(err);
  // });

  window.ethereum
  .request({ method: 'eth_requestAccounts' })
  .then(handleAccountsChanged)
  .catch((err) => {
    if (err.code === 4001) {
      // EIP-1193 userRejectedRequest error
      // If this happens, the user rejected the connection request.
      console.log('Please connect to MetaMask.');
    } else {
      console.error(err);
    }
  });

  ethereum
  .on('accountsChanged', handleAccountsChanged);

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
      setCurrentAccount(
        accounts[0]
      )
      setProvider(
        new ethers.providers.Web3Provider(window.ethereum)
      )
    }
  }

  return (
    <BlockchainContext.Provider value={{ currentAccount, provider, chainId }}>
      {provider && children}
    </BlockchainContext.Provider>
  );
};

export default BlockchainContextProvider;
