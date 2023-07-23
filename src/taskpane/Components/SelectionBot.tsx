import * as React from "react";
import * as util from '../utils/inkbot.js'

export interface HeaderProps {
    setLoading:any;
}

export interface AppState {
    selectionText:string;
    responseText:string;
    userPrompt:string;
    responseList:any;
    currentResponse:any;
}

export default class SelectionBot extends React.Component<HeaderProps, AppState> {
    
    constructor(props, context) {
        super(props, context);
        this.state= {
            selectionText:'undefined',
            responseText:null,
            userPrompt:'',
            responseList:[],
            currentResponse:null
        };
    }
  
    async componentDidMount() {
        Office.context.document.addHandlerAsync(Office.EventType.DocumentSelectionChanged, this.onSelectionChanged.bind(this));
        this.onSelectionChanged();
    }

    async onSelectionChanged() {
        console.log('selection changed')
        
        let text = await util.getSelectedText();
        
        console.log('text',text, this.state.responseText);
        
        if(this.state.responseText)
        {
            console.log('same text')
            this.setState({
                ...this.state,
                responseText:null
            });
            return;
        }

        this.setState({
            ...this.state,
            selectionText:text
        })
    }

    async componentWillUnmount() {
        Office.context.document.removeHandlerAsync(Office.EventType.DocumentSelectionChanged, { handler: this.onSelectionChanged });
    }


    async onSubmitSelection()
    {
        // if(!this.state.selectionText)
        // {
        //     return;
        // }
        let prompt=this.state.userPrompt;
        // this.setState({
        //     ...this.state,
        //     userPrompt:''
        // })
        let text=await util.submitSelection(this.state.selectionText, prompt, this.props.setLoading);
        this.setState({
            ...this.state,
            responseText:text
        },
        ()=>util.placeText(text))
        this.addResponse(text)
    }

    addResponse(response)
    {
        let responseList = this.state.responseList;
        let currentResponse=responseList.length;
        responseList.push(response);
        this.setState({
            ...this.state,
            responseList:responseList,
            currentResponse:currentResponse
        })
    }

    onPromptChange(e)
    {
        this.setState({
            ...this.state,
            userPrompt:e.target.value
        })
        // adjust the height of the textarea box to fit the content
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';

    }

    textAreaListener(e)
    {
        // check if user presses enter
        if(e.keyCode==13)
        {
            e.preventDefault();
            this.onSubmitSelection();
        }
        // if user presses control + enter or shift + enter, add a new line
        else if((e.keyCode==13 && e.ctrlKey) || (e.keyCode==13 && e.shiftKey))
        {
            e.preventDefault();
            let text = this.state.userPrompt;
            text+='\n';
            this.setState({
                ...this.state,
                userPrompt:text
            })
        }
    }

    switchResponse(direction)
    {
        let currentResponse = this.state.currentResponse;
        let responseList = this.state.responseList;
        if(currentResponse+direction>=0 && currentResponse+direction<responseList.length)
        {
            this.setState({
                ...this.state,
                currentResponse:currentResponse+direction
            })
        }
        else if(currentResponse+direction>=responseList.length)
        {
            this.onSubmitSelection();
        }
    }

    clearResponseList()
    {
        this.setState({
            ...this.state,
            responseList:[],
            currentResponse:null,
            responseText:null,
            userPrompt:'',
        })
    }

    onChangeResponseTextarea(e)
    {
        let responseList = this.state.responseList;
        responseList[this.state.currentResponse]=e.target.value;
        this.setState({
            ...this.state,
            responseList:responseList
        })
    }

    render() {
    return (
        <div className="selection-bot-container" >
            {/* <div>
            <label>Selected Content</label>
            <div className="selection-container">
            {this.state.selectionText}
            </div>
            </div> */}
            <div className="textbox-container">
                <div className="label-container">
                <label htmlFor="">Prompt</label>
                {this.state.responseList.length>0&&<div className="btn clear-button" onClick={()=>this.clearResponseList()} >
                    Clear
                </div>}
                </div>
            <textarea className="textbox" placeholder="Draft a severity clause" value={this.state.userPrompt} onKeyDown={(e)=>this.textAreaListener(e)} onChange={(e)=>this.onPromptChange(e)} />
            </div>
          {this.state.responseList.length>0&&<div className="selection-response-container">
            <div className="response-label-container">
            <label>Result</label>

            <div className="result-navigation-buttons">
                <button className="response-navigation left" onClick={()=>this.switchResponse(-1)} >{'<'}</button>
                <div className="response-navigation">{this.state.currentResponse+1}</div>
                <button className="response-navigation right" onClick={()=>this.switchResponse(1)} >{'>'}</button>
            </div>

            </div>
            <div className="result-textbox">
            <textarea className="textbox" placeholder="Result" onChange={(e)=>this.onChangeResponseTextarea(e)}  value={this.state.responseList.length==0?this.state.responseText:this.state.responseList[this.state.currentResponse]} />
           <div className="chat-item-actions">
        <div className="chat-item-action-button" onClick={()=>{util.placeText(this.state.responseList[this.state.currentResponse])}} >
        <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Group 1935">
<path id="Vector" d="M4.9375 1H1.875C1.64294 1 1.42038 1.09482 1.25628 1.2636C1.09219 1.43239 1 1.66131 1 1.9V9.1C1 9.33869 1.09219 9.56761 1.25628 9.7364C1.42038 9.90518 1.64294 10 1.875 10H7.125C7.35706 10 7.57962 9.90518 7.74372 9.7364C7.90781 9.56761 8 9.33869 8 9.1V4.15L4.9375 1Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_2" d="M4 3.7002L3 5.5002L4 7.3002" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path id="Vector_3" d="M6 5.5H3" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>

        </div>
        <div className="chat-item-action-button" onClick={()=>{util.copyText(this.state.responseList[this.state.currentResponse])}} >
        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.66901 3.57715H5.40866C4.88579 3.57715 4.46191 4.00102 4.46191 4.52389V8.78425C4.46191 9.30712 4.88579 9.73099 5.40866 9.73099H9.66901C10.1919 9.73099 10.6158 9.30712 10.6158 8.78425V4.52389C10.6158 4.00102 10.1919 3.57715 9.66901 3.57715Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.80488 6.65385H2.33151C2.08042 6.65385 1.83961 6.5541 1.66206 6.37655C1.48451 6.199 1.38477 5.95819 1.38477 5.7071V1.44675C1.38477 1.19565 1.48451 0.954845 1.66206 0.777295C1.83961 0.599746 2.08042 0.5 2.33151 0.5H6.59187C6.84296 0.5 7.08377 0.599746 7.26132 0.777295C7.43887 0.954845 7.53861 1.19565 7.53861 1.44675V1.92012" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </div>
      </div>
            </div>

            </div>}
            <div className="send-button">
            <button className="selection-submit-button" onClick={()=>this.onSubmitSelection()}>
                <span className="ms-Button-label">{this.state.responseList.length==0?'Draft':'Re-Draft'}</span>
            </button>
            </div>
            
            </div>
    );
  }
}
