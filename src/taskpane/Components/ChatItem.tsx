import React, { Component } from 'react'
import * as util from '../utils/inkbot.js';

export interface AppProps {
    chatData:string|any;
    key:any;
    setResponding:any;
    bottomEl:any;
    isBottomVisible:any;
  }
  
  export interface AppState {
    chatData:string|any;
    localText:string;
    isResponding:boolean;
    hasResponded:boolean;
    source:string;
  }

export default class ChatItem extends Component<AppProps, AppState> {
    constructor(props, context) {
        super(props, context);
        this.state= {
            chatData:props.chatData,
            localText:'',
            isResponding:false,
            hasResponded:false,
            source:''
        };
      }
    
      mainEl=React.createRef<HTMLDivElement>();

    streamLocalText(){
      if(this.state.hasResponded)
      {
        return;
      }
        let data=this.state.chatData;
        var source='';
        let text=data.message;
        // if(data.isBot&&!data.isLoading)
        // {
        if(data.isBot&&!data.isLoading)
        {
          var json;
          try{
          json=JSON.parse(data.message);
          text=json.answer;
          source=json.sources;
          console.log(json);
        }
        catch(e)
        {
          console.log(e);
        }
        }

        // }

        console.log('source', source)
          if(!data.isBot||data.isLoading){
            this.setState({
                ...this.state,
                localText:text,
                source:source,
                isResponding:false,
                hasResponded:true
            })
            return;
        }
        if(data.isBot){
          this.props.setResponding(true);
          this.setState({
            ...this.state,
            isResponding:true,
            source:source
          })
        let interval = setInterval(() => {
            if (text.length > this.state.localText.length) {
                this.setState({
                    ...this.state,
                localText: text.substr(0, this.state.localText.length + 1)
                });
                // console.log(this.props.bottomEl)
                if(this.props.bottomEl&&this.props.isBottomVisible)
                {
                  this.props.bottomEl.scrollIntoView();
                }
            } else {
                this.props.setResponding(false);
                this.setState({
                    ...this.state,
                    isResponding:false,
                    hasResponded:true
                  })
                clearInterval(interval);
            }
            }
        , 10);
        }
    }

    componentDidMount() {
        this.streamLocalText();
        this.mainEl.current.scrollIntoView();
    }

  render() {
    if(this.state.chatData.isLoading)
    {
      return(
        <div ref={this.mainEl} className="chat-item bot-chat">
          <img src={require('../../images/inkpaper.svg')} alt="" />
          Loading...
        </div>
      )
    }
    return (
      <div ref={this.mainEl} className={this.state.chatData.isBot?'chat-item bot-chat':'chat-item'}>
        <div>
        {this.state.localText}
        </div>
        {
          !this.state.isResponding&&this.state.chatData.isBot&&!this.state.chatData.isLoading&&this.state.source&&
          <div className="chat-item-source">
            {this.state.source}
          </div>
        }
      {!this.state.isResponding&&this.state.chatData.isBot&&<div className="chat-item-actions">
        <div className="chat-item-action-button" onClick={()=>{util.placeText(this.state.localText)}} >
        <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Group 1935">
<path id="Vector" d="M4.9375 1H1.875C1.64294 1 1.42038 1.09482 1.25628 1.2636C1.09219 1.43239 1 1.66131 1 1.9V9.1C1 9.33869 1.09219 9.56761 1.25628 9.7364C1.42038 9.90518 1.64294 10 1.875 10H7.125C7.35706 10 7.57962 9.90518 7.74372 9.7364C7.90781 9.56761 8 9.33869 8 9.1V4.15L4.9375 1Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_2" d="M4 3.7002L3 5.5002L4 7.3002" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_3" d="M6 5.5H3" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>

        </div>
        <div className="chat-item-action-button" onClick={()=>{util.copyText(this.state.localText)}} >
        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.66901 3.57715H5.40866C4.88579 3.57715 4.46191 4.00102 4.46191 4.52389V8.78425C4.46191 9.30712 4.88579 9.73099 5.40866 9.73099H9.66901C10.1919 9.73099 10.6158 9.30712 10.6158 8.78425V4.52389C10.6158 4.00102 10.1919 3.57715 9.66901 3.57715Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.80488 6.65385H2.33151C2.08042 6.65385 1.83961 6.5541 1.66206 6.37655C1.48451 6.199 1.38477 5.95819 1.38477 5.7071V1.44675C1.38477 1.19565 1.48451 0.954845 1.66206 0.777295C1.83961 0.599746 2.08042 0.5 2.33151 0.5H6.59187C6.84296 0.5 7.08377 0.599746 7.26132 0.777295C7.43887 0.954845 7.53861 1.19565 7.53861 1.44675V1.92012" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </div>
      </div>}
      </div>
    )
  }
}
