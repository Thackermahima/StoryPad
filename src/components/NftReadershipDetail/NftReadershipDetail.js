import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from 'react-avatar';
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useParams } from 'react-router-dom';
import { mintParentContract } from "../../config";
import ContractABI from "../../abi/mintContractParent.json";
import ContractChildABI from "../../abi/mintContract.json";
import { ethers } from "ethers";
import web3 from "web3";
function NftReadershipDetail() {
  const { address } = useParams()
  console.log(address, 'address in NFT detail');
  const { Moralis, isInitialized } = useMoralis();
  let results = [];
  const [resultData, setResultData] = useState([]);
  const [imageURls, setImageURLs] = useState([]);
  const [tokenId, setTokenId] = useState([]);
  const [tokenAddress, setTokenAddress] = useState();
  const [authorData, setAuthorData] = useState();

  const getSoldData = Moralis.Object.extend("soldItems");
  const solditems = new getSoldData();
  let images = [];
  let Items = [];
  let addresses;

  useEffect(() => {
    const getAuthorCollection = async () => {
      const storyPad = Moralis.Object.extend("nftMetadata");
      const query = new Moralis.Query(storyPad);
      query.equalTo("CurrentUser", address);
      const objects = await query.find()


      results.push(objects);
      setResultData(results)

      results.map((obj) => {
        setAuthorData(obj[0].attributes);
        images = obj[0].attributes.imageArr;
        addresses = obj[0].attributes.tokenContractAddress;
        setTokenAddress(addresses);
      });

      const queries = new Moralis.Query(getSoldData);
      queries.equalTo("tokenAddress", addresses);
      const ItemData = await queries.find();
      Items.push(ItemData);
      console.log(Items, "items fron storyItems");


      images.map((obj) => {
        let find =
          Items.length > 0 &&
          Items[0].some((item) => item.attributes.tokenId == obj.tokenId);
        if (find) {
          obj.sold = true;
        } else {
          obj.sold = false;
        }
      });
      setImageURLs(images);

    }
    if (isInitialized) {
      getAuthorCollection()
    }
  }, [])


  const buyMarketItem = async (tokenID) => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const storyMintContract = new ethers.Contract(
      mintParentContract,
      ContractABI.abi,
      signer
    );
    console.log(storyMintContract, "contractObj");
    const p = authorData && authorData.tokenPrice * (100 + 2) / 100;
    console.log(p, "----p");
    let price = p.toFixed(3);
    console.log(price, '---price');
    console.log(parseInt(tokenID));
    console.log(web3.utils.toWei(price.toString(), "ether"), "wei");
    // const childContract = new ethers.Contract(
    //   tokenAddress,
    //   ContractChildABI.abi,
    //   signer
    // );
    // let transactionApprove = await childContract.approve(,  parseInt(tokenID.toString()));
    // let txa = transactionApprove.wait();
    await storyMintContract.callPurchaseItem(parseInt(tokenID), tokenAddress, { value: ethers.utils.parseUnits(price.toString(), "ether"), })

    solditems.set("tokenAddress", tokenAddress);
    solditems.set("tokenId", tokenID);
    solditems.save();


  }
  return (
    // console.log(obj.attributes.authorName,"obj")
    <div style={{ marginBottom: "0px" }} className="app-container">
      {resultData.map((obj) => {
        return (
          <>
            <div className="profile-layout">
              <header className="background background-lg" style={{ backgroundColor: "#4b2caa" }}>
                <div className="avatar avatar-profile center-block">
                  <Avatar name="Foo Bar" round={true} />
                </div>
                <div className="badges">
                  <h1 className="profile-name h3">{obj[0].attributes.authorName}</h1>
                </div>
              </header>
            </div>
            <div style={{ marginTop: "62px" }} className="container">
              <div className="row">
                {imageURls.map((img) => {
                  return (
                    <div className="col-md-3 col-sm-6">
                      <div className="card-readership-detail card-block">
                        <h4 className="card-title-readership text-right"></h4>
                        <img className="Nft-img" src={img.imageUrl} alt="Photo of sunset" />
                        <h5 className="card-title-readership mt-3 mb-3"> {img.tokenId} {obj[0].attributes.symbol}</h5>

                        {img.sold ? (
                            <button
                              type="button"
                              class="btn btn-outline-success"
                             disabled
                            >
                             Sold Out
                            </button>
                          ) : (
                            <button
                              type="button"
                              class="btn btn-outline-success"
                              onClick={() => {
                                buyMarketItem(img.tokenId);
                              }}
                            >
                              Buy for {obj[0].attributes.tokenPrice} MATIC
                            </button>
                          )}
                       
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )
      })
      }
    </div>
  )
}
export default NftReadershipDetail;