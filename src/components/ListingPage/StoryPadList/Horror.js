import React, { useContext, useEffect, useState } from "react";
import Chip from "@material-ui/core/Chip";
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";
import axios from "axios";
import { useMoralis, useMoralisQuery } from "react-moralis";



import { BookContext } from '../../../Context/BookContext'
import ModalContribute from "../../Contribute/Contribute";

function Horror() {
  const { Moralis, user, account, isInitialized } = useMoralis();
  const { data, fetch } = useMoralisQuery("nftMetadata");
  const storyContext = React.useContext(BookContext);


  const { storyD } = storyContext;

  useEffect(() => {
    const bList = JSON.parse(JSON.stringify(storyD));
    const tokenList = JSON.parse(JSON.stringify(data));

    if (bList && tokenList) {
      ListStoryData(bList, tokenList)
    }
  }, [storyD, isInitialized, data])

  const [storyData, setstoryData] = useState([]);

  async function ListStoryData(bList, tokenList) {

    var array = [];
    if (bList) {
      for (let index = 0; index < bList.length; index++) {
        const element = bList[index];
        if (element.CID) {

          await axios.get(`https://${element.CID}.ipfs.dweb.link/story.json`).then(async (response) => {
            if (response.data.walletAddress) {
              const id = element.objectId
              let wall = response.data.walletAddress;

              tokenList.map((e) => {
                let tokAdd = e.tokenContractAddress;
                if (wall == e.CurrentUser) {
                  var newData = { ...response.data, id, element, tokAdd }
                  array.push(newData)
                }
              })
            }
          });
        }
      }
    }
    setstoryData(array);
  }
  console.log(storyData, 'storydata horror');


  return (
    <>
      <div style={{ marginTop: "100px" }} className="container">
        <div className="text-center">
        </div>
        <div className="container">
          <div className="card-columns">

            {storyData !== undefined &&
              storyData.map((e) => {
                if (e !== undefined && e.category == "Horror") {
                  return (
                    <div className="card carding">
                      <a href="#">
                        <img className="card-img-top" src={e.coverPicture} alt="Card image cap" />
                        <div className="card-body">
                          <h5 className="story-card-title">{e.name}</h5>
                          <p className="card-text">
                            {e.description}
                          </p>

                          <p class="card-text"><small className="text-muted">Last updated {new Date().toLocaleString()}</small></p>
                          {/* <button type="button" class="btn btn-outline-danger buy-story-btn">Buy Story</button> */}
                          {e.element.nftholder_access && e.element.general_access == 1 ? ('') :

                            <ModalContribute walletAddress={e.walletAddress}
                              e={e}
                            // chargeble={e.chargeble}
                            // discount={e.discount}
                            ></ModalContribute>

                          }

                          {
                            (e.element.nftholder_access && e.element.general_access == 2) ?
                              <Button disabled={true} variant="outline-info btn-outline-danger buy-story-btn">Read Full Story</Button>
                              :
                              <Link
                                to={`/horror-detail/${e.id}`}>
                                <Button variant="outline-info btn-outline-danger buy-story-btn" disabled={false} >Read Full Story</Button>
                              </Link>
                          }
                        </div>
                      </a>
                    </div>
                  )
                }

              }

              )
            }
          </div>
        </div>
      </div>
    </>

  )
}
export default Horror;