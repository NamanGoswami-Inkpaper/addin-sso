import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import ChatItem from "./ChatItem";
import SelectionBot from "./SelectionBot";
import * as util from '../utils/inkbot.js';
// import { pca } from '../utils/inkbot.js';
// import { MsalProvider, useMsal } from "@azure/msal-react";
// import { PublicClientApplication } from "@azure/msal-browser";



/* global Word, require */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  reviewItems: any[];
  reviewInputVal:string;
  chatItems:any[];
  inputVal:string;
  isPristine:boolean;
  isResponding:boolean;
  currentTab:number;
  inkbotTab:number;
  appLoading:boolean;
  previousCurrentTab:number;
  documentString:string;
  inkbotPrompt:string;
  reviewPrompt:string;
  isBottomElVisible:any;
  userReaction:number;
  userReactionText:string;
  currentPopup:any;
}


let authSSO = true;


let StartChattingButton=({state, setState})=>{

  // const {instance}= useMsal();

  const userAuth = async () => {
  
      // const handleSignIn = () => {
      //   instance.loginRedirect({
      //     scopes: ['user.read']
      //   });
      // }
      // handleSignIn();

      // const scopes = {scopes: ["User.ReadWrite"]}
      // const loginResponse = await pca.loginPopup(scopes);
      
    await util.getAccessToken(authSSO);

    setState({
      state,
      isPristine: false
    })

  }
  
  return (
    <div className="inkbot-welcome-screen-button">
      <DefaultButton onClick={()=>userAuth()}>Get Started</DefaultButton>
    </div>
  )

};


export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      reviewItems: [],
      reviewInputVal:'',
      chatItems:[],
      inputVal:'',
      isPristine:true,
      isResponding:false,
      currentTab:2,
      inkbotTab:0,
      appLoading:false,
      previousCurrentTab:0,
      documentString:'',
      inkbotPrompt:'',
      reviewPrompt:'',
      isBottomElVisible:false,
      userReaction:null,
      userReactionText:'',
      currentPopup:''
    };
    this.bottomEl=React.createRef();
  }

  bottomEl:any;

  setBottomElListener()
  {
    let options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    };
    let observer = new IntersectionObserver((entries, observer) => {
      observer=observer;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if(!this.state.isBottomElVisible)
          this.setState({
            ...this.state,
            isBottomElVisible:true
            })
          }
          else 
          {
            if(this.state.isBottomElVisible)
            this.setState({
              ...this.state,
              isBottomElVisible:false
            })
          }
        });
      })
      if(this.bottomEl.current)
    observer.observe(this.bottomEl.current);
  }
  
  closePopup()
  {
    this.setState({
      ...this.state,
      currentPopup:''
    })
  }

  setReaction(value)
  {
    this.setState({
      ...this.state,
      userReaction:value
    })
  }

  onChangeInput(e){
    this.setState({
      inputVal:e.target.value
    })
  }

  onChangeReviewInput(e)
  {
    this.setState({
      ...this.state,
      reviewInputVal:e.target.value
    })

  }

  async handleReviewSubmit(e){
    e.preventDefault();
    if(this.state.isResponding||this.state.reviewInputVal==''){
      return;
    }
    let value=this.state.reviewInputVal;
    let userText={
      message:value,
      isBot:false
    }
    let loadingText={
      message:'...',
      isBot:true,
      isLoading:true
    }
    this.setState({
      ...this.state,
      reviewInputVal:'',
      isResponding:true,
      reviewItems:[...this.state.reviewItems,  userText, loadingText]
    },
    this.bottomEl.current.scrollIntoView());
    let botResponse=await util.getResponseExtract(value);
    let chatItemsArray=this.state.reviewItems;
    chatItemsArray.pop();
    let botText={
      message:botResponse,
      isBot:true
    }
    this.setState({
      ...this.state,
      reviewItems:[...chatItemsArray]
    });
    chatItemsArray.push(botText);
    this.setState({
      ...this.state,
      reviewItems:[...chatItemsArray]
    },
    this.bottomEl.current.scrollIntoView()
    );
  }
  async handleSubmit(e){
    e.preventDefault();
    if(this.state.isResponding||this.state.inputVal==''){
      return;
    }
    let value=this.state.inputVal;
    let userText={
      message:value,
      isBot:false
    }
    let loadingText={
      message:'...',
      isBot:true,
      isLoading:true
    }
    this.setState({
      ...this.state,
      inputVal:'',
      isResponding:true,
      chatItems:[...this.state.chatItems,  userText, loadingText]
    })
    let botResponse=await util.getBotresponse(value);
    let chatItemsArray=this.state.chatItems;
    chatItemsArray.pop();
    let botText={
      message:botResponse,
      isBot:true
    }
    this.setState({
      ...this.state,
      chatItems:[...chatItemsArray]
    });
    chatItemsArray.push(botText);
    console.log(chatItemsArray)
    this.setState({
      ...this.state,
      chatItems:[...chatItemsArray]
    });
    console.log(this.state);
  }

  getBotresponse(value:any){
    console.log(value);
    return 'Hi This is Inkbot, How can I help you?';
  }
  setResponding(value:boolean){
    console.log('setResponding',value)
    this.setState({
      ...this.state,
      isResponding:value
    })
  }

  componentDidMount() {
    let inkbotPrompt=util.getInkbotPrompt();
    let reviewPrompt=util.getReviewPrompt();
    let documentString=util.getDocumentString();
    this.setState({
      ...this.state,
      inkbotPrompt:inkbotPrompt,
      reviewPrompt:reviewPrompt,
      documentString:documentString
    })
  }
  
  // call setBottomElListener after render
  componentDidUpdate()
  {
    this.setBottomElListener();
  }



  click = async () => {
    return Word.run(async (context) => {
      /**
       * Insert your Word code here
       */

      // insert a paragraph at the end of the document.
      const paragraph = context.document.body.insertParagraph("Hello World", Word.InsertLocation.end);

      // change the paragraph color to blue.
      paragraph.font.color = "blue";

      await context.sync();
    });
  };

  setCurrentTab(value)
  {
    let previousTab=this.state.currentTab;
    if(previousTab==value)
    {
      return;
    }
    this.setState({
      ...this.state,
      previousCurrentTab:previousTab,
      currentTab:value
    })  
  }

  setInkbotTab(value)
  {
    this.setState({
      ...this.state,
      inkbotTab:value
    })
  }

  setAppLoading(value)
  {
    console.log('setAppLoading',value)
    this.setState({
      ...this.state,
      appLoading:value
    })
  }

  onChangeDocumentString(e)
  {
    this.setState({
      ...this.state,
      documentString:e.target.value
    })
    util.setDocumentPrompt(e.target.value);
  }

  onChangeInkbotPrompt(e)
  {
    this.setState({
      ...this.state,
      inkbotPrompt:e.target.value
    })
    util.setInkbotPrompt(e.target.value);
  }

  onChangeReviewPrompt(e)
  {
    this.setState({
      ...this.state,
      reviewPrompt:e.target.value
    })
    util.setReviewPrompt(e.target.value);
  }

  onChangeUserReactionText(e)
  {
    this.setState({
      ...this.state,
      userReactionText:e.target.value
    })
  }

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress
          title={title}
          logo={require("./../../../assets/logo-filled.png")}
          message="Please sideload your addin to see app body."
        />
      );
    }

    return (
      <div className="inkbot-canvas-main">
        {this.state.appLoading&&<div className="inkbot-app-loading">
          Loading...
          </div>
          }

        {this.state.isPristine&&<div className="inkbot-welcome-screen">
          <div className="inkbot-title-container">
          <div className="inkpaper-logo">
          <svg width="71" height="41" viewBox="0 0 71 41" fill="none" xmlns="http://www.w3.org/2000/svg" >
<rect width="71" height="41" fill="url(#pattern0)"/>
<defs>
<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
<use href="#image0_804_28966" transform="matrix(0.000807103 0 0 0.00139767 0 -0.013642)"/>
</pattern>
<image id="image0_804_28966" width="1239" height="735" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABNcAAALfCAYAAABCaCRzAAAACXBIWXMAAC4jAAAuIwF4pT92AAAgAElEQVR4nOzdzXEcSZYu7Kxrsyc3uQY/BTLYEoC9DksDRwLiSgCUBHBIUIAEFyVBE5aW6yEkaEYoMOQ6N0UJ+FmwT81UVfMHBAGkn/DnMetlm5HuxciI4/6e89PHjx8XAAAAAMD3+z/WDAAAAADuRnENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO5IcQ0AAAAA7khxDQAAAADuSHENAAAAAO7oPywczNtyXcpisTizzXyHD4vF4sVuU95aNPiyfhhfLhaLf1gigNn5z223em1bgdtycw1mbLkuzxXWuIMni8XiysLBl/XD+HSxWFxYIoBZuornPMCtKK7BvPnw46665br47we+bLoVfGB9AGZpOmh0cw24NcU1mKnlupwuFotD+8sPOFmuy0sLCH/WD+OL6d+HZQGYtcN+GE9tMXAbP338+NFCwcws12W6xv4uTt3gR0z9157vNuWdVYR/6Ydx6kfYWQ6A2fv0HrTtVt6DgK9ycw3m6UphjXui/xr8QT+MRWENoBniocCtKK7BzCzXZYorHdlX7tFhTJ2FpvXD+MyQGIDmdHGwAvBFimswIxEHdcuIh3AWhVtomecrQJvO+mF8bu+BL1Fcg3k5Nb2OB3QVBVxoTj+Mx4bEADTtqh9G70HAZymuwUws1+W5uBIP7MDNHVoUH1MXNh+gaVO/TfFQ4LMU12A+fPjxGI6W62IsPa0xJAaAyUk/jNpkAP/mp48fP1oVSC6KHb/YRx7R33ab8taCM3fxEfVfNhqA8H6xWDzfdqvfLAjwOzfXILnogeWKOo9N/zVmL+KgotAA/JE2GcC/UVyD/MSV2IdOFJkGFENiAPiMo34YX1oY4HdioZDYcl3Eldi3/7vbFKe3zE4/jNOQmH/aWQC+4EPEQ99ZIMDNNUgqInmKGuzbxXJdntkFZsjzFYCveeK3Avid4hrkdSquRAWmF8vXNoI56YfxNKLPAPA1h/GbATROLBQSWq6LuBK1udxtipdL0uuHcbqJ+VYvSwBuaYqHvth2K1PUoWFurkFOGslTm5PlumjsyxwYEgPA9xAPBRTXIJvl+tPtoEMbR4WuohcgpBST3zxfAfheXT+MxapBuxTXIJEoXPjhplb6r5FWP4yGxADwI85i0jTQIMU1yEVcidodLtdFAZiMLjxfAfhBr+OwBmiM4hoksVyXF4vF4sh+kcBZDN2AFPphnJ6vr+wWAD/oQMoE2qS4BglEHFRciUxe679GIp6vANyXkzi0ARqiuAY5nMZJGGRxoGBBBtGA2vMVgPskHgqNUVyDykW87sw+kdBRTLeFKkXjac9XAO7bE4eM0BbFNajfhT0isaL/GhXzfAXgoRz1w/jS6kIbFNegYnHr59Aekdink1v916hNP4yerwA8tKt+GJ9ZZZg/xTWoVBQjTBtiDjo3hKhJfOh4vgLw0MRDoRGKa1Cvq/hBhjl4tVwX0QhqceH5CsAjOYzb0sCM/fTx40f7C5VZrss0vvu/7Asz82GxWDzfbco7G8u+RP+bf9gAAB7Z37bd6q1Fh3lycw0qE3FQ18eZo+mm0Gs7y770w/hURBmAPfF+DzOmuAb1ma6NH9gXZqpbroviBvtSPF8B2JOuH0b9PmGmxEKhIst1eb5YLP5pT2jA33eb8sZG81j6YRS3B6AGf992K+9AMDNurkFdXBenFa8jAg2PxY1JAGpwFW0KgBlRXINKLNdlioN29oNG6L/Go4kYjucrADU4iDYFwIyIhUIFluvybLFYvI2CA7Tk591GDzYeTj+M0/P1vy0xAJX5z223ctAIM+HmGtThQmGNRv0SvQbhoYjbA1Aj8VCYEcU12LPlurxcLBZH9oGG6b/Gg+iH8XixWBxaXQAq9MQBEMyH4hrsURQUROJo3YGXS+5b3AbwfAWgZkdxEAQkp7gG+1WisACtO1qui5dL7tOVuD0ACVxEf1AgMcU12JPoM3Vi/eF/XOi/xn3oh/GFuD0ASYiHwgworsH++BGFP/v0cqn/Gj8i4qCerwBkctgPY7FjkJfiGuzBcl1OF4tFZ+3h33QRl4a7ErcHIKOzfhjd4IekFNfgkS3X5ZniAXzVSUzRhe8SHyXi9gBk5eY1JKW4Bo/vQpNt+KarKETD9/BRAkBmXT+MJl1DQopr8IjiNo4m2/BtUwH6tXXitvphFLcHYA5OYjAPkMhPHz9+tF/wCKJJ+1u9gOC7nO82RYyar+qH8Vk8X90KBmAO3i8Wi+fbbvWb3YQc3FyDx6PJNny/s+W6OL3lW64U1gCYkYNoJQMk4eYaPILlukxNtv9preFOPiwWi2e7TXF6y7/ph3GK2//DygAwQ/+57VbaZEACbq7B49BkG+7uiX9DfE4/jE/9twHAjF3Fbx1QOcU1eGDLddFkG37cUfxbgj8yfRmAOXPACEmIhcIDWq6LJttwv/6225S31pSYpPZfzS8EAC34edut9GCDirm5Bg/LrQq4X69j8i44yQegFSUmYwOVUlyDB7Jcl6nJ9pH1hXtlehbTrTXTlwFoiXgoVE4sFB5A3Kx56+MPHsz/3W2Kl8wG9cNo+jIArTrfdqti96E+bq7Bw3CrAh7WxXJdnlvjJrm5CECrzuKQCaiM4hrcs/jgP7Gu8KDEIxrUD+M0Mfaw9XUAoGlX/TDqPwuVUVyD++eDHx5Ht1wXt5gaEY2cRWEAaF3n9xDqo7gG92i5Lqfxgwc8jpMYHsL8mb4MAP9y0g/jC2sB9TDQAO7Jcl2exRADH3/wuD4sFovnu015Z93nqR/GqYD6j9bXAQD+4P30/rPtVr9ZFNg/N9fg/rhVAfuh/9qMRV8Z8V8A+LMD7z9QD8U1uAcRSzuylrA3h8t10X9knkxfBoDPO4rb3cCeiYXCD1quy9OIg/r4g/37+25T3tiHeYh+Mv/V+joAwFdM7TGeiYfCfrm5Bj/OrQqox1UUvJkHcVAA+LqpPcZrawT7pbgGP2C5Ls+naT3WEKqh/8hM9MNYTF8GgFs57Ifx1FLB/iiuwY/xEQ/1OVquixfMxPphnKYvn7W+DgDwHUr8fgJ7oLgGdxQf725VQJ1+iZul5OTgAgC+j3go7JHiGtzBcl2eRa81oF76ryXUD+PxFG9pfR0A4A66aKsAPDLFNbibizgdAurVaYifSz+MT+0ZAPyQs34Y3d6HR6a4Bt9puS4vp55O1g1SeLVcl2NblcaVgwsA+GGv48AKeCSKa/AdImLmVgXkchFRbirWD+MLBxcAcC8OtLCBx6W4Bt+nxI8VkIcGv5WL03VDDADg/pzEwRXwCBTX4JZi8uCJ9YKUuuW6uHVaLwcXAHD/xEPhkSiuwe25VQG5nUTPRCoSTZcdXADA/XviGwYeh+Ia3MJyXU5j8iCQ21X0TqQeXvoB4OEc9cPocBEemOIafEM0QtcQFOZB/7WK9MPo4AIAHt5VP4yGO8EDUlyDb7uID3JgHg6X66Jgvmfxkm8fAODhiYfCA1Ncg6+I/kxH1ghm5yyGlLA/Vw4uAODRHMaNceAB/PTx40frCp8RfZnemmAHs/V+sVg8323Kb7b4cUXvl3+09HcGgAp8WCwWL7bd6q3NgPvl5hp8WVFYg1k7EJF4fP0wPrXuALAX4qHwQBTX4DMiLnZibWD2jmIaMI9HH0sA2J+uH0Y9T+GeKa7B5znRgXYU/dceRz+MLxaLxasW/q4AULGzfhi9+8A9UlyDv4hbLJ11gWZ8ikhEn0UeloMLAKjD62jVANwDxTX4g+W6PItea0Bbuogr8kAigqKPJQDU4cB3D9wfxTX4M72AoF2vluvy0v7fv4ienM3t7wUAyZ3EBG/gBymuQYiP6iPrAU27ihus3C+3AgGgTlfiofDjFNfgX4W1pz7+gLi5+tpC3J9+GKc+lodz+fsAwMw80RMVfpziGvyLXkDA77rluii234N+GPWxBID6HfXDeGyf4O4U12jecl2mXkAnra8D8Ccny3V5YUl+mD6WAJDDRRyKAXeguAauQQOf9zoi49xBNEjWxxIAchAPhR+guEbTlusyxZW61tcB+CwvmXcUjZFFawEgl8PolQp8p58+fvxozWhSTAR8K7KU3t93m/Km9UWAmvTDeCFuDwBp/W3brd7aPrg9N9do2ZXCWnrXCmtQl34YXyisAUBqbu7Dd1Jco0nLdZl6AR3a/dQ+LBYLU42gPuKgAJBb1w+jad/wHRTXaE40KHcak9/xblN+a30RoCbxIq6PJQDkdxa30YFbUFyjRUUcNL0pDvq69UWAmsT4/jObAgCzcRVDioBvUFyjKct10QsovykOaooR1MeNYACYl4O4mAB8g+IardELKL+y25R3rS8C1KQfxmN9LAFglk76YXxpa+Hrfvr48aMlognLdSkiS+nd7DZF7weoSMRF3onbA8BsTcmRZ9tupd8xfIGbazRhuS7PRAnTMx0U6nSlsAYAs/ZE+wf4OsU1WuHjL78LcVCoS0wRO7ItADB7R/0wuqwAXyAWyuwt12XqEfAPO53asNuU560vAtQk4qBvo9kxADB/U5Lk+bZbOfCGv3BzjVlbrstTV5hnQRwU6lMU1gCgKeKh8AWKa8xdEQdN73y3KW9bXwSoST+M003SE5sCAM057Iex2Hb4M8U1Zmu5/jRV0sdfbu+nXmutLwJUyKk1ALTrLA7agPAfFoIZU5TJ73i3KUZ+Q0WimXFnT5j6YW67lY8r4M76YZwOa15ZwZSmvfMbAMHNNWZpuS7Fx196l7tNedP6IkBN+mF8FnF7WOiHCdyD00gqkE/XD6PLDBAU15id5bo8ix9q8nrvAx6qdKWPJeF82630wwR+yLZbTQmFl1YxrZN+GF+0vgiwUFxjpnz85XcqDgp16Ydx+vg5tC1EHNQBCHAvolB/bjXTuuqH8WnriwCKa8zKcl18/OV3vduU160vAtQkXpoNMeB34qDAvYqC/Y1VTelAr2tQXGNGluvi4y+/Dz7aoEoXbgQTxEGBh3Ic74Lk8ypuuEOzFNeYk+LjLz3TQaEy0UvFJDcW4qDAQ9p2q3cOWVMTD6VpimvMwnJdpo+/E7uZ2o04KFTJjWB+Z1gQ8KC23Wp6F/zVKqc0XXLwLk+zFNeYCzn/3MRBoUL9MJbopQKX2271pvlVAB7DaUyOJ5/DfhgdxNAkxTXSW67L9PHX2cnUym5T3rW+CFCTfhifLxaLM5tCfOSKgwKPYtutfnPomlrph/FZ64tAexTXSG25Ls/EVNKb4qBuHkJ9/Lvkd8fxsQvwKOKm7LnVTkk8lCYprpHdlSEG6TmZhMpEpOPQviAOCuxLDFAZbEBKXbSWgGYorpHWcl1e+vhL71wcFOoSUQ4vxCzEQYEKvIzevORzFi0moAmKa6S0XJenJtilN+w2xUcb1OfCjWCCOCiwV9tu9U4LmNSu+mF82voi0AbFNbIqPv7SEweFyvTDON0QOLIviIMCtdh2q+lA/dqGpNS5AU0rFNdIZ7kuLxaLxYmdS22Kg75tfRGgJnGybIgBC3FQoELH8Wwin5N+GF/YN+ZOcY2MfPzl9t4eQpWmYsqBrWGKYImDAjWJZ5LUQ17iocye4hqpLNefenR1di21492m+GiDisSJshvBTK633eq1lQBqE1H1cxuT0oF+2cyd4hppLNflmYam6V3uNkUPH6iP26QsYiKfmyFAtbbdajpoH+xQSkfR2xVmSXGNTK4MMUjtgx4+UJ9+GN0I5nemgwIZvIz3SvIRD2W2FNdIYbku04/ood1KTRwUKtMP43Qj+My+IA4KZLHtVu8c2KY1XZTwW8MsKa5RveW6PJXRT+96tyl+SKE+nq0sxEGBbLbdampncG3jUjrsh1GrH2ZHcY0Mijhoaj7aoEL9MB67EUwQBwUyOhYPTav0w/i89UVgXhTXqNpyXUywy+9UHBTqEv1ODDFgIQ4KZBWHAhrk5/TE7XnmRnGN2vn4y+1mtyl+OKE+BsSwcLMYyG7braYp9Jc2MqUuhirBLCiuUa3luphgl5uPNqhQP4zTjeAje8MUyxEHBbLbdqupf9dgI1M6Ew9lLhTXqNJyXaYJdhpd5lZ2m/Ku9UWAmkQc1G1SJjfREBxgDvRfy+t1vJ9Aaopr1EpkKbcpDuqjDeoz3Qg+sC/Nc7MYmJVtt3obv3Hkc2DvmAPFNaqzXJeXJtil59YhVCZiFwbEsIg4qJvFwKzEbdxru5rSSbStgLQU16jKcl1ElvI7323K29YXASrk2cpCHBSYOfHQvMRDSU1xjdoUcdDUht2muNYNlemH8dSAGMRBgbmLIS0vbXRKTxwEkpniGtVYrssLkaX0fLRBZfphfKaXCUEcFJi9bbd6s1gsLu10Skf9MCqOkpLiGjURU8ntUhwUqmRADAtxUKAx06HSYNNTuoqDQUhFcY0qLNefooQiS3m9dzMG6hOnvwbEsHCzGGhJxEM993ISDyUlxTX2brkuz0yXTO94tym/tb4IUJNoCuzllMm5OCjQmm23mhIVP9v4lA6jXyykobhGDUSWcvt1tylvWl8EqNCFZytTLGrbrdwsBpoUcfgbu59S6YfxeeuLQB6Ka+zVcl1ElnL74NYh1KcfxmlAzCtbg1gUwKfpoR8sQzrioaSiuMbeLNdFZCk/cVCok2cri4iDGjQDNE3/tdS6fhjdviYFxTX2qYgspXa925TXrS8C1CZeQg9sTPPEQQHCtltN76yX1iOls7iRD1VTXGMvlusyPSBPrH5aH5wAQn2iN8mZrcEzGuDfTAcOg2VJ6SoGNUG1FNfYlwsrn1oRB4UqebayEAcF+HfioakdRHEUqqW4xqNbrsv0YOysfFo3u03xAQ+ViZH1BsQgDgrwBXHw8LP1SemkH8aXrS8C9VJc41Et1+WZyFJq4qBQoX4YnznRJZjgDPAV2241HRLfWKOUxEOpluIaj80Eu9ymOOi71hcBKnRhQAxTs+5tt3pjIQC+6WUcGpPLE9+T1EpxjUezXJdjkaXUBnFQqE9EJI5sTfPeu70IcDv6r6V21A+jvaM6ims8iuW6PNVoOz0/YlCZiEZ4tjI5jo9FAG5h261eLxaLX61VShfREgOqobjGYxFZyu18tykmz0F9SkzQom3ioAB3cxo3f8lFPJTqKK7x4Jbr8mKxWLyy0mlNcVBRI6hMP4zTs/XEvjRPHBTgjuLGrwmUOR3GpHSoguIaj8GpQm5+tKBO4qAsxEEBfsy2W03pjHPLmNIv/TA+b30RqIPiGg9quS4iS7ld7jZF1Agq0w/j9Gzt7EvzxEEB7sG2W02/qzfWMiUXOaiC4hoPZrkuU5PJMyuclqgRVCga+Hq24hkNcL+m4V0frGk6XT+MbvOzd4prPCSnCLkd7zZF1Ajq49nK5FQcFOD+bLvVO9Px0zqJXrSwN4prPIjlukw/TIdWN61fxUGhPv0werYyud52q9dWAuB+xbP1V8ua0lU/jE9bXwT2R3GNe7dcl6cabaf2wRADqE+8MHq28sHNCoAHdRrRe3I58J7EPimu8RCmh9oTK5uWOCjU6cqzFdNBAR5WPGNfWuaUXvXDaO/Yi58+fvxo5bk3y3WZsu7/ZUXTut5tih8kqEz0EfFsZYqDekYDPIKYzG2AUD7TDe9nDqJ4bG6ucd802s5LHBQqFHFQz1bEQQEe0bZbTcW1wZqn88R7E/uguMa9Wa5Liaw7OZXdpryzd1Adz1YW4qAAe/EyDjfI5agfRpcGeFRiodyL5bo8WywW/20107rZbYrx1VCZfhifLxaLf9qX5omDAuxJTOr+f9Y/nako+nzbrVwe4FG4ucZ9cfU2L1EjqJdnK57RAHu07VbTb/G1PUhHPJRHpbjGD1uuy/TSf2gl07oQB4X6RJyhszXNK+KgAHs3fe+8tw3pHMZgCnhwYqH8kOW6TI2238XJAPkMu015bt+gLv0wTlH7t56tzbvZdiuRfYAKmNyd2t+23ept64vAw3JzjR914eMvNVEjqNOVZ2vzxEEBKrLtVm8Wi8W5PUlJPJQHp7jGnS3Xnxrgv7KCaZ3vNsUJDlSmH8aXovZEHFRkH6Ai2241RQwHe5JO1w/jReuLwMNSXONHOAHI6/1uU/QfgMr0w/jUs5WIg/oIAKjTy7hdTC4nEe2FB6G4xp0s158KMwdWLy1RI6iTqD3ioAAVi1vFp/Yopas4yIR7p7jGd1uuy9Ro+8zKpXW525Q3rS8C1CZOU0XtEQcFqNy2W023zK/tUzoHEgI8FMU17sIDKa9phLg4KNTJsxVxUIA8jsVDUzqK/rZwrxTX+C7LdTnWaDu1492m/Nb6IkBt+mEUtWchDgqQx7Zb/Rb918hHPJR7p7jGrS3X5Wn0AyKna3FQqE8/jM9F7ZkmOIuDAuSy7VbTu/WlbUtn6m/7uvVF4H4prvE9NNrOS4NsqJdDC4ZttxLZB0ho262m4QaDvUvnsB9Ggym4N4pr3MpyXTTazk0cFCoUL3Wi9jj8AMhN/7WcSj+Mz1pfBO6H4hq3pdF2Xje7TXHtGSoTL3NuKzHFQd82vwoAicVz3G96PuKh3BvFNb5puS4abeclDgr1ErVHHBRgJmLa87X9TKeLwVLwQxTX+KrlujzTaDu1stsUDbKhMjEC/si+NM/hB8C8iIfmdBYDpuDOFNf4FnHQvKY4qEbpUJkY/e7fJuKgADOz7VZTj+OX9jWlq3hHgztRXOOLlutyrNF2am5EQJ1E7REHBZipbbd6s1gsLu1vOp2+efwIxTU+a7kublbkdi4OCvXph3GavHxia5pn9D/AjG271fScH+xxOifxrgbfTXGNL9FoO69htylOXaBODi24jFsNAMybFElO4qHcieIa/2a5LlO1/pWVScsPOVQoJlF19qZp70VOANoQfTV/tt3pHOg7zl0orvE5HiZ5TXFQDbKhMv0wmrzM5DiaXQPQgG23mm6s39jrdI5isjvcmuIaf7JcF42283ovcgbVcmiBOChAm6YizQd7n85VHI7CrSiu8T+W6+JmRW7Hu01xIwIq0w/jqcnLzRMHBWhU3FjWtiWfJw5H+R6Ka/yRh0del7tNcSMCKhMNcRVVEAcFaNi2W72e3tf9N5DOYRySwjcprvHJcl2O3axIy40IqNeVycvNEwcFYBHv64OVSKf0w/i89UXg2xTXmAprT/XqSu1UHBTq0w/jNHn5yNY0zeEHAJ+Ih6YlHsqtKK6xiMKamxU5Xe825XXriwC1iTioFzFOxUEB+N22W01T/X+2IOl0/TA6LOOrFNcat1yX6WbFq9bXIakPTr+gWiYvcx09dgDgf2y71XSx4caKpHMmHsrX/IfVaZ6bFXmJg0KF4sXrxN40zeEHexcHqJ8YegTVeblYLN5JD6XzenrPcyudz/np48ePFqZRy3WZblactb4OSd3sNv/70gzUox/GKfLR2ZKm/adba3zJH4tef/Es/vc5X/v/3OaW7M+7TdFfFyrSD+NUYPuHPUlnGlRkgij/RnGtUct1mV7G/rv1dUhquhHxfLcp71pfCKhN9ONwaNG2KQ76svVFyGhPRa/H4t0BKtQP45UWPSn93SRw/kostF3ioHkVL8dQn34Yp49pJ5ltEwd9ADMvej2W36fdufUOdTmNf5f6tOYyxUOfiYfyR26uNWi5LtOL//9rfR2SEgeFSvXDOJ1gHtqfpjUVB1X0Sul8tykm3kFFolfrP+1JOm6q8yeKa41ZrstTzTNT+9tuU962vghQG31TqP0lOwphil4svEtAfbSVSOv/bruVRBifiIW250JhLa1zL8NQn34Yn4raNy9DHPSlKbaE6Xn13GJAPbbdqvTD+MIN+HQupuTCtltp2cPi/1iCdsSptYaZOQ1iHFAthxaUBH1Xpt+QoYI/B/vXxcR4oC7HcVhDHk8csPI7xbW2+IeflwbZUKE4ZXZo0babbbe6qH0Fdpvymw83/uDsKz3zgD2I20/e+fM57IfRQCsU11oRJ5R6puR0KQ4K9REHJdt00Pgt8QHA766iFy9QiRiK86v9SOeXGExBwxTXGrBcl+caZKb1PqI8QH1OHVo0r2Trs7LblKkgfF3BH4X9O/COAVU6jW8AcnHg2jjFtTZUH1fhi44jygNUJE4nHVq0LUUc9AuOfbgRTpbrUu2UW2hR9PD07zKfLqa+0ijFtZlbrsupqTNpTXHQN60vAlTKoUXbUsVB/yoObXy48TvxUKjMtltNMf5z+5LOWfTjpUGKazMWL0qq5zl9sHdQp2ha69CibenioH8V/dd8uLEw7Q7qtO1WpjzndBV9eWmM4tq8XcULE/mIg0KF+mF8pvDdvMxx0D/ZbT4NO7qp6I/E/hyJh0KVXprynI5+lo1SXJupGK9+1Po6JHW925TXrS8CVOrCoUXz0sZBv8CHG7+b4qHPrAbUI25Jm/Kcz0k/jA4sGqO4NkMRB3W9P6fUfXxgzuIlyaFF286zx0H/Sv81/kA8FCq07VamPOckHtoYxbV5Oo3rqORzKg4K9YmXIx+dbRui/83sxPCcy9Y3mE8OYxgWUBdTnvNxYNEYxbWZWa7L82lKSevrkNTNblM8gKFORRy0ebO+VbzbfCqoaJzNpIiHQl223eo36ZaUjvphtG+NUFybn1k0WW6QOChUKkaqn9ifpk1x0LcNLID+ayziIEHvV6jMtlu9MeU5pYsYiMXMKa7NSFzjP2x9HZIqu02ZVR8fmBGHFm2bbRz0r+J3SCSQSbdcF9PuoDLxe+SWcS7ioY1QXJuJGGLgJSinYbcpPt6hQjWiJ3EAACAASURBVP0wTs/Vzt40ralbxdGe4NcK/ijs31m0GwHq4pZxPofxTsmMKa7Nx5V+QGmJg0KF4gq/HpZtayUO+lf6r/G7qzjABSoRU6vdMs7nrB9GBxYzprg2A8t1mfoBHbW+Dkmd7zalxQ83yMAV/rY1Ewf9q5ha7eCHRdzcddsCKrPtVtM7yrV9Sce75YwpriUXp4n+keY0xUG9sEKF+mHUw5KmbwXEwc/PFfxR2L+TOMgF6jIdgry3J6l0/TBqBzRTimv5TS//B60vQlKuc0OF+mHUw5LLmMrWtOgH6mYEC/FQqM+2W7llnNNJTKJnZhTXEosms/oB5XS525TmP9ygUnpYtu294uqfuBnBIg5y3baAysRB0KV9SecqDnOZEcW13Lzk5OTDDSoVJ4l6WLbtOG4DoP8af/ZquS4vrQnUZdutDKHJx4HFDCmuJbVcF/2A8jqOjxWgInGCqIdl28RBPyNuWp9X9wdjH8RDoU7TIcgHe5PKq34YHVjMiOJaQvFS4+ZTTr+Kg0K1ih6WTXOr+CtiAM9NtX9AHssThxBQn223eus3LCXx0BlRXMtJP6CcPhhiAHXqh3HqYXlie5omDvptbkYwOYoEBVCRbbcyhCYfBxYzoriWTIxC1w8oJ3FQqJcXm7aJg97CblPe6b9GKMt1eWYxoDoOQfI56ofRgcUMKK4lEnFQH4A5Xe825XXriwA16odxilF0NqdZ4qDfIX7LTKbDbQuoUNzA1scrn9IPowOL5BTXcjnVDyilD076oU7xIuO0sG2n4qDfZ7cpJtMxORQPhfrETWyHILlMBxYuYiSnuJbEcl2mfkBnra9DUkUcFKqlh2Xbrrfdysvs3YgeMfkl3lGBimy7lUOQfLpIU5CU4loeF60vQFI3u02xd1ChGH9+aG+a5VbxD9htylu3PgnioVAnhyD5nMWQLRJSXEsgrtz7AMzHhxtUKsae+yBsm+mgP2i3KVcm0zHdtliui9sWUJltt3qrp2hKV/GeSjKKa5WLIQYeijldxGQ1oD4X4qBNEwe9P8cxFIK2ncVEe6Ai2241ve/c2JNUOt//OSmu1U8/oJyG3cYpLtSoH8bpA/CVzWmWW8X3KHqKmkzH5CoOhYG6vBQPTeck3ldJRHGtYnECeNT6OiTlww0qJA6KOOj9i/5rP8/t78V3O3DbAuoTv3m+TfIRD01Gca1ScfLnAzCn8/jQAOpzGh+AtEkc9IHE8B7RI07EQ6E+8dt3aWtSOVAPyEVxrV4+AHN6Lw4KdYrpS2e2p1nioA9P9IjJa/FQqNL0jTLYmlSOYro9CSiuVWi5Lj4A8/LhBvW6sDdNK+KgD0v/NcITty2gPuKhaYmHJqG4VicfgDld7jblTeuLADXqh3G6DXxoc5p1ExPTeGDxO3hunZt3tFwXhVaozLZb6ZGZz3RgoaVFAoprlVmuiw/AnN5r4gt16ofxmX+fTRMHfWTRHkH0iGl66LPmVwEqE4dNemTmchgHxVRMca0i0Z/CB2BOxxGHAepzEad+tGmKg76z949O/zXEQ6FentH5lDgwplKKa3W58gGY0rU4KNQpmsAe2Z5miYPuyW5T3rkxyHTbIlIZQEX0X0tJPLRyimuViLHlPgDzETeCSkXzV7cm2uX5vGe7TZk+An5tehGYFPFQqM+2W03P6Etbk0rXD6OkW6UU1yoQcVAfgDmJg0K9itvATRMHrcOp/mvNc9sC6lWidzR5nPXD+Nx+1UdxrQ7Ti+dB64uQ0HWcygOV6Ydxug18Yl+aJQ5aiTiAOtbbp3ndcl3ctoDKRDzUZN98XkdCg4ooru3Zcl2mqvNZ04uQ04coigJ1UlhpmzhoRXab8tbAJqb33XjvBSqy7VbTM/rcnqRy4He1Popr++cDMKcSzZqBykQvis6+NOtcHLQ+u02Z3neuW18HFlfRDgWoyLZbTe9ON/YklZNIalAJxbU9iulJh80uQF438ZEAVCZGlLsN3K4hPhCo07HePs3r3LaAaonw5yMeWhHFtT2JUzsvF/mYPgd1MxymbZ7PFftD/zXadhJT8oGKxK1vz+hcnnj3rYfi2v5cmWKX0oU4KNSpH0a3gdt2Hn1jqNhuU97o7YN4KNRp262mYW2/2p5UjvphNJSiAoprexCndUfN/cXzG3Ybk66gRnEl3r/PdomDJhK/pXr7tO1A32Go1qkIfzpX0RqFPVJce2RxSufqZk6uSUO93AZum+dzPi/19mneq+W6uG0Bldl2q9/iGU0e4qEVUFx7fKdxWkcu57tNETeCCsWkJLeB2yUOmpD+awTxUKhQ/K6K8OdyGC1S2BPFtUe0XJfnptil9F50AeoUcVAnde0SB01stylTb5/L1tehcW5bQKXi91WEP5fSD+Pz1hdhXxTXHpcCTU7HccIO1Ke4Ddw0J7TJ7TZl2sOh9XVo3NFyXfxbhjodi/Cn4sBijxTXHkm8NJhil89lTDYDKhMncyf2pVmX227l+TwP+q9RluuiGTdUZtut3jnISqfrh9Gt/j1QXHsE0UvCf+D5vLdvUDUnc+3yfJ6R3ab4eMNtC6jUtltN/zav7U8qZ+Khj09x7XGYYpfTqTgo1ClO5Drb06zjmGbGTOw2ZXpX+tV+Nu1QPBSqdRwHW+TxOnoT80gU1x7Ycl1MscvpOhotA5Xph/GZWy5NEwedr1Mfb837JQaAARWJAy0TnnM5cMv/cSmuPaCIg7rins8HPx5QNbeB2yUOOmNxW/xl6+uAd2eoURxsnducVE76YfS7+kgU1x7WqSl2KZkOCpWKFwTDYdolDjpzu015u1gsfm59HRrXLddFER0qtO1WxYTndK7EQx+H4toDiSvtZ7P8y83bjTgo1CleDNxoaJc4aCN2m3KheXbzzqK1ClAfE55zMTDmkSiuPRz/AecjDgp1uxAHbZY4aHuOfbw17yparAAV2XYrE57zOeqH0XfuA1NcewAx6cgUu3zKblPetb4IUKN+GKcbDK9sTrNOxUHbov8amnFDvbbd6soN43QuYigYD0Rx7Z4t1+WZF4GUbiKGAlRGHLR519tuJa7foN2maJ7NiXgoVOvYhOdUxEMfmOLa/RNbysk1WaiX4TDtEtdv3G5TNM/mtXgo1CdulPuNzuWwH0aR3geiuHaPlusyxReOZvMXase5OCjUqR9Gw2HaZjooC82zm+e2BVQqBg1d2p9Ufon3a+6Z4to9iRM1scJ8hjgVB+rkudoucVA+iQMwtyPadhSH2EBltt3q1A3jdBxYPADFtftTxJZS8rIOlYpr64f2p0nioPzJblNeux3RvKvobQzUx4TnXLp+GF0wuWeKa/dguS7TtcqT9H+R9lzuNuVt64sANYppRn702yUOyufov9Y28VCo1LZbvfXels5ZTOPnniiu3Q8/9Pm89wMAVTMcpl3ioHzWblN+czuieYfLddGMGyq07VbTu9u1vUnlKqbycw8U135Q/MB3qf8SbTqOl3SgMv0wGg7TLnFQvipunCuutK2Ih0K1HIDkcqC/8f1RXPsB8cPu9lM+Uxz0TeuLADWK0zO3gdtVxEH5lt2mXLkd0bTpVrPbrVCh+A03fCSXV3GwzQ9SXPsxYkv5fFAQhaoVz9Vm3USkBG7jOFo80KZuuTbtHWq07VZvDKBJRzz0Hiiu3VGMAxdbykccFCoVTVUNh2mTOCjfJX7LnbS37SyGigGV2XarUwNoUjEw5h4ort3Bcl2eyiandB2j/IE6ea62a4qDvmt9Efg+0X/t3LI17Srey4H66L+Wy1E/jHqa/gDFtbsp0fyPPNyKgIr1w1gMh2mWOCh3ttt8igbeWMFmddp9QJ223eqtf5/plH4YDYy5I8W17xTXz8WW8jkVB4U6xY/4me1pkoMP7sNLtyOadrJclxetLwLUKA7PHIDkIR76AxTXvp//2PK5icliQJ38+2yXOCg/TP81xEOhag5AcjmMRAnfSXHtOyzX5VRsKR23IqBi0dvh0B41SRyUe7PbFNPp2nagbyfUadutfvM9ls5ZP4wGxnwnxbVbWq7LM5nxlMpuU9yKgArFyG/P1XZ50eZe7TbFdLq2vYpp/kBltt3qtQOQdCRLvpPi2u1dRAaZPKY4qFNMqNeV52qzzsVBeSDiR20TD4V6FQcgqXT9MPqW/g6Ka7cQp2BH1f9B+SujhKFS/TC+8Fxt1rDtVm4s8iDitrrf/3Zpxg2VEg9N6STe2bkFxbVviNMvFdt8zneb8rb1RYAaRRzUx0+7vFjzoGKI0a9WuVlH0ScZqMy2W03fZz/bl1Su4t2db1Bc+7YSTVLJY9htilsRUC/P1Xadx4s1PDT919pWol8yUJkYZnRjX9IwMOaWFNe+Yrku04SMk2r/gHyJ00qoVEwe8lxtkzgoj2a3KeJHbRMPhbrpj5nLq34YDYz5BsW1r/OjnM9ljOMH6uS52i6FDh5VtIcQP2rXoXgo1En/tZTEQ79Bce0L4se4q/IPx5e8j7gZUKF+GIvnarPEQdmLmBp+bfWb9UskUYDKbLvV6+lihH1JY7oR/Lr1RfgaxbXPiB4NijT5HEcMBKhMP4zPRLabJQ7Kvh2LHzXNjWmoV4kLEuRw2A+j9/kvUFz7vIuozJLHr+KgULUrz9VmeQljr+LgTa+YdnXLtUFXUKOIh3o+51Li0Jy/UFz7i+W6TP+4j6r6Q/EtH3y8Qb2iAeqhLWrS5bZbOfhg7+IA7txONOtsuS4vWl8EqFG0jfB8zkM89AsU1/5guS5PjZlNSRwUKhWNT0Vy2qQPJlXZbT7dXrqxK826ind9oDLRPsLzOY8ueinzB4prfzb9B3JQ0x+Ib7rebYrKOdRLzL5dxxH3gJrov9auAwV/qJrncy5n/TAaGPMHimshJgmdVPGH4bY+GOEM9eqHcYrgvLJFTRIHpUq7TXnn3aFpJ+KhUKdtt/J8zucqUirNWyiu/YnYUj5FHBTqJA7aNHFQqhY33i/tUrNei4dCnbbdano+/2p70ui88/0vxbV/3Vo7jf8wyONmtyn640G9TsXsmyUOSvV2m0/vfoOdatIThz9QtdM4qCOHk0irNK/54tpyXZ6ptqYjDgoVi/4LZ/aoSeKgZKK/T7uOluvysvVFgBrFAZ1/n7k0Hw9dKK59otl2PiV6pgB1cqu0TeKgpLLblLdxQ4I2XcUhO1CZbbeans/n9iWNKa3S/I3gpotrcWJ1VMEfhdsbxEGhXv0wTh+qh7aoSafioGSz25TpY+DaxjVJPBQqtu1W04HdjT1K46gfxqZvHDZbXItGpoo0+YiDQqX6YRSzb9d1NCGGjI7192nWYfReBuokvp9L0/HQlm+uFc220zmPCAdQJzH7NumDSWoxeVx/n3YV8VCo07ZbvfOOkcr0HdDsYWuTxbXlukzNtk8q+KNwe1Mc1I0YqFRcAxezb5PpoKQXh3c/28kmNf0xCLWLm/Hi+3kcRpuY5rR6c01/hXxc2YdKxfVvz9U2iYMyG9HTVX+fNnXLtUNcqJj4fi6lH8bnrf2lmyuuRV+FroI/Crd3uduUN9YLqlXEQZskDsocvdTfp1lnkW4BKhM35L1z5NHkwJimimvRT8GpVC7v7RnUqx/GF2L2zRIHZXb0X2veVQw9Ayqz7VbTZYtz+5JG1w9jU9/xrd1c02w7n+N40QXqZOpym8RBma24LX9ph5vUOdSFem271fTvc7BFaZy1FA9tpri2XBfNtvO5FgeFesVplJh9e8RBmb3d5lMbER9wbTpZrsuL1hcBKia+n8vr6M88e00U1+J6t9sVufh4g4r1wzjF7M/sUZOKOCiN8AHXLvFQqNS2W70z7C6Vg1ZuBLdyc63EppKHOCjUzXTQNt1su5XDKpqw25R3DvqadeBgHuq17VbTe+i1LUrjJPo0z9rsi2sx9Uez7VymOKhePlCpfhin08JD+9McN4ppTryP/Grnm/Qq2soAdTqO4XfkMPt4aAs319yuyOWDa75Qr/hR1Oy5TSWiGNAa/dfaJR4KlYoWFQ798ngy99rMrItry/WnZrSabedSIoYB1OnK1OUmiYPSrGhTcaz/WpNm/zEImW271TT87twmpnHUD+NsbwT/9PHjxwr+GPdvuS5Ts+23PgJTudltTGeCWkWvhP+yQc2ZCgrP3VqjdXFo+0vr69Con3eb4oABKtUP41uXatKY7XvlnG+uXSispaKXD1Qs4qBO79skDgr/usF2oYF2s0oc3AN1crs4j9neCJ5lcS2ajx5V8Efh9i7EQaFqpi63SRwU/kwD7TaJh0LFtt3qrZ7AqRzGgLRZmV0sNJqOvvURmMqw23ya6gpUqB/G6d/nP+1Nk/4/t9bgz5brIiLfLvFQqFg/jK9dsknlb1EYnYU53lxzuyIfcVCom9P6Np0rrMG/222KBtrt+mW5diAMFRMPzWVW3xizKq7Fj91JBX8Ubu98tymzqVbD3PTDWDSIbdKw7VbiFfAFu02Z/n3cWJ8mOXCCSm271TTdebbTKGeoi2+NWZjbzTU/drm8j5dToEL9ME7Nm2fXD4FbcaMYvu2lGxJN6pZr769Qq223mm4XX9qgNM76YXwxh7/IbIpr8SPndkUuPt6gblemLjfpfE79L+Ch7DblN+8yzTqL3ntAhbbdajocHuxNGlf9MD7N/peYRXEtRmO7XZHLZfQsASrUD+N0I+PQ3jRHHBS+w25TXrsh0ayrGKQG1En/tTwO5jDtdS4319yuyOW9UclQrzg5ErNvk1s48J12m+KGRJtm8TEIcxW38P0bzeMkDvfTSl9cW66L2xX5nEaUAqjThQOLJomDwt25IdGmE/FQqNe2W03vtNe2KI3U8dDUxbW4iu12RS7XEaEAKhQNRV/Zm+aIg8IPiMnnWpS06bV4KFTN4UceTzLXd7LfXCtuV6TyQeQI6iUO2jRFAfhBu02Znp+/WsfmpP4YhLnbdivDZ3I56ocx5X6lLa7FFeyTCv4o3N6xOChU7TR6yNCWyxhbD/y40+gtS1uOolUNUKFttzJ8JpeLfhifZftDZ765dlHBn4HbuxEHhXr1w/h8sVic2aLmGDAD9ygOERVZ2jRND033MQgNKYbPpJHyRnDK4tpyXaZ/GF0FfxRuRxwU6ufAok3HEZcA7kn0X/vZejZHPBQqJh6azmE/jKnalqQrrsWJkN4wuZTdprxrfRGgVvHDZepye8RB4YHsNsWEujYdLtfFdwpUKqaiO/zI45dI16SQ8ebalSEGqdzECyZQoehnIBbYHnFQeHgm1LWpiIdCvbbdavo2vbFFaaS5EZyquBaNQt2uyMXVW6jbhQOLJomDwgPTf61Z02+qPsNQt5cOP9Lo+mFMcVknTXFtuS5P9TFI51wcFOrVD+P0YnFki5ojDgqPZLcp07+1c+vdnC56RAMV0n8tnZN+GF/U/ofOdHOtuF2RyrDbeKmAWvXD6MCiTeKg8MjifciEuvacLdclTa8gaM22W003TC9tfBpX8f1SrUzFNZXlXHy0Q90cWLTpVBwU9kJRu02GG0Dd9AbP46D2VgvZbq6RR4koL1CZOPU5sS/NuY5TWuDxeY9tzwf7DtVTXMtj2Harqi/wpCmuxcRJUz3yeOL2GtQpbi65Bt+WD26Aw35E763O8jen6D0M9dJ7OJ3qbwKnmhbqwyCdo5jwCtSnmJLUlHfioPD4oufWmaVvzhAXA4AK6T2cTophXKmKa3H6Y+JSLhfioVCfKLToBdOOaYy5eBI8Ph9vbXIhAOqm93AeaSL22W6umbiUz4F+E1Cn6Fsgbt+Os34YTa6DRyIO2qzL3aa8bX0RoFb9ML7QeziV4yzpi3TFteA0KJeT5bq8aH0RoFJur7VFTAkegThos947VIZ6iYOmc5NpGFfK4lqcBomH5nIlHgr12Xart4YbNOWwH0YFVXh4Pt7adLzbFP0toV4lklXUL90wrqw318RD8xEPhXoZbtCW0g/js9YXAR7Kcl1OxUGbdL3blOobbkOrojWGOGgeF9tulWrictriWhAPzeUkYhJARQw3aM4Tt2rgYSzX5ZnDxCalu2EBDfLuk8ew7VbpfktTF9ciHirOlIuHGlTIcIPmiIfCw7gyga5Jp+KgUK+YmO5GcR4p31Gz31xbxOng+wr+HNxOF9OzgPootrRFPBTuUcRBD61pc252m+LwGCoVcVADZvL4ddutUkbs0xfX4pTINexczsRDoT6GGzTniemhcD/EQZslDgr1866Tx4fMh/1zuLm2iOahPghz8ZCDOhlu0Jajfhhftr4IcA/EQdt0sduUVA23oSXRAsON4jxOoxd0SrMorgXx0FwOIz4BVMRwgyZd9cP4tPVFgLsSB23WsNtodQK1itYX/o3mcRM9oNOaTXFNPDSlEjEKoCKGGzTH9FC4I3HQpjmIgrq5UZxL+lrOnG6u/R4P/bWCPwq344MO6uWjoS3ioXA3Fz7emnQZ3x1AhfphPHajOJXzbbdKH7GfVXEtnOoXlMoUD3XjECpjuEGTLsRD4faW6zIVpI8sWXPeu60I9Yp3Gf2983i/7VazeKbOrrgmHprSxXJdfNBBfQw3aMuBD0a4nXhvcfu+TafxvQHUSRw0l9nUbuZ4c20qsL1eLBbXFfxRuB3xUKiQ4QZNOumH8UXriwC34OOtTdfxnQFUKFpcuFGcx6/bbjWbiP0si2vh2I2LVI4iXgFUxHCDJpkeCl8hDtqsD9IxUK94d3FhI48PczvEn21xTTw0pSvxUKiS22ttEQ+FLxAHbVoRB4WqFTeKUzmNlMxszPnm2u/xUDcu8nii+STUx3CDJomHwueJg7bpZrcp3lGhUvHOcmJ/0riJdMyszLq4FsRDc3m1XBcfdFAfww3a40MS/kActGnSMFApcdCUZvlMnX1xbbcp78Rb0hEPhcoYbtCkrh9Gv58gDtq68/ieAOpUoqUFOZxvu9Usn6kt3FxbxDVu8dA89PuBChlu0KSzfhift74IoJdPs97vNsU7KVQq3lHEQfN4v+1Ws32mNlFcC+KhuZyIh0KV3F5rj9s6NC3eR3y8tUkcFOrmHSWXWT9TmymuiYempN8PVMZwgyaJh9IscdCmXe425U3riwC1ineTzgal8eu2W836mdrSzTXx0Hy65dpVfKiQ4QbtOe2H8Vnri0CT9PJp0weH8lCviIOe2aI0PrSQfmmquBZEmnI5W66Lfj9QEcMNmvTE7R1aIw7atOPdpvzW+iJAxSSccjmN74dZa664ttuUKdJ0XsEfhdvzQQeVMdygSYf9MCqq0gRx0KZd7zbldeuLALWKd5FDG5TGTXw3zF6LN9cWMfVnqOCPwu2Ih0KdFFraU8RDaYQ4aJuaiC5BVvEO4rswl2YGwzRZXAum/+RyulwXH3RQEcMNmiQeyuyJgzatxBA0oE5X8S5CDufbbtXMM7XZ4pp4aDo+6KBOhhu0Z4qHOqBizrxvtOkmhp8BFYp3D3HQPN5vu1VTtwxbvrkmHprP4XJdXNWHihhu0KyLfhiftr4IzE+0oRAHbZPfMqhUvHMofufS3EFs08W14Ic0lyIeCnUx3KBJbhMzOzGd/MzONuk8Ui1AncRBc/l1263etPaXbr64ttuUN3oGpfLEqQVUyUFFe476YXzZ+iIwKwrGbXrv3RLqFe8aR7YojWYHwzRfXAslfljJ4Wi5Lj7ooCKGGzTrSjyUOYg4aGczm3S825TfWl8EqFG8Yzj4yOU02sY0R3HtX7fXfjM9NJ2r5br4oIO6GG7QHreJSU8ctGm/RooFqFMRB03lJtrFNElxLYiHpqPfD1TGcINmveqH8UXri0Bq3ifa1Gx0CTKId4sTm5VK0xeWFNf+TDw0lyke6oMOKmK4QbPEQ0lJHLRp4qBQKXHQlM633epdywuguPYH4qEpiYdCfdwEaM9BHFBBGuKgTbvZbcrr1hcBKnYa7xbk0PxgmIXi2r+LeOh1bX8uvsgHHVTGcINmnYiHkkzzHwKN+uAwHerVD6ODj3yOWx1i8EeKa593rCl3KifioVAdww3aJB5KCst1mW5FHNqtJl3sNqXp6BJUThw0l+ttt2p+MMxCce3zxENTEg+Fihhu0KwD+07tluvyzK33Zg27TbH3UKl+GPXBzMVN4D9QXPuC6MMgHpqHDzqojOEGzTqLSAfU6iqmjtMeH4FQqX4Yn4mDplPEQf+X4trXiYfmchbNiYF6KHq3SaSDKomDNu1ytylvW18EqJh3h1xutt1K79I/UFz7ioiH+jDMxUMZKmK4QbO6iHZANcRBm/be3kO9+mF08JGPOslfKK59w25TxJpy6ZZrvTSgMoYbtEk8lNqIg7brOA7NgcpEHNT3Wy7ncYDOHyiu3Y54aC5ncToNVMBwg6aJC1AFcdCmXe82xSQ7qJeDj1zee7/7PMW1W4hx3arpuYiHQkUMN2jWYUQ9YG9imrj3uDaZZAcV64fxpYOPdI4NMfg8xbVb2m3KhQ/DVA7jlBqoh3+TbSoR+YB9cSuiXafioFCnfhifuhCRzvW2W7kJ/AWKa99HPDSXIh4K9TDcoFlPvDyzL8t1mW5FHNmAJt1E72SgTg4+cnET+BsU176DeGg6PuigPoYbtEk8lEcXcVDvAe3yEQiVijiog49cijjo1ymufaeIhw6p/tBtO4xTa6AChhs0TTyUx+ZWRLvO41AcqEzEQTXEz+Vm263s2Tcort2Nk7BcruL0GqiA4QbNeuJlmsciDtq0YbcpkiZQr+nf54H9ScXB+C0ort3BblOmvkHn6f7g7RIPhfr4kW7TUURB4MGIgzbP7wtUqh/GF4vF4sT+pHIefZP5BsW1O4oTMfHQPI7EQ6Eehhs07SoiIfBQxEHbdbnbFJPsoEKmg6b0Xurg9hTXfox4aC7ioVAXww3a5DYxD0YctGnvDR6Dqp2Kg6ZzbIjB7Smu/QDx0HSeeOmCehhu0DTxUO5dHKA5YW/X6W5TfARChfphfL5YLM7sTSrX227lJvB3UFz7ZEgjFwAAIABJREFUQREPfZ/6L9GWk+W6vGh9EaAWhhs07UI8lHumSXa7rneb8rr1RYCKubGeywcpve+nuHY//IeXi3go1MXttTYduE3MfYmDM02y2+QjECrWD+P0W9/Zo1SKOOj3U1y7B9E4VWPuPHzQQUUMN2jaSUwOgzszHbR5RRwU6tQP4zNx0HRutt1Ki4U7UFy7P+KhuUzx0OetLwJUxHCDdpkeyo8SB23XzW5TfARCvRx85CNRckeKa/ckTsxcSc/Fwx4qYbhB09wm5s7EQZvndwMq1Q/j9O/z0P6kch6JEu5Ace0eiYem0y3XxQcdVMJwg6aJh/LdxEGbdx6T+4HKRBzUd1Yu703c/jGKa/dPPDSXM/FQqIpbCO3yQsf3Egdt1/uY2A/UaTr4eGJvUjk2xODHKK7ds4iH+jjMxQcdVMJwg6Z1MVEMvkkctHlasUCl+mF8KQ6azvW2W71pfRF+lOLaA9htyuvpP9DZ/cXm63C5LgqiUA/DDdp11g+j28TchoOxdl1GKxagMjGgSFw/lw8OLO6H4trDOfZxmEpZrsuz1hcBamC4QfO8lPNV0S+1s0pN+qCPE1RNHDSfIg56PxTXHojpoek88UEH9TDcoGnioXxR9Ek9s0LNOo53bKAyEQc9si+p3Gy7lZvg90Rx7QGJh6YjHgp18e+xXacxaQz+ykFYu67j3RqoTMRBFWny8a59jxTXHp54aC4lRvsDe2a4QdPcJubfiIM27YOPQKia6c35XMa7NvdEce2BxdV18ZY8fNBBXQw3aNdhP4w+pvlEHLR5Zbcp71pfBKhRP4ymN+fzXo3i/imuPYLdplzoHZTK0XJdXra+CFADww2aV8RDCQ6+2jXEuzRQGdNB0zo1xOD+Ka49HvHQXK7EQ6EOhhs0zW1ixEExIAzqdSoOms71tlvpX/kAFNceSVxld/UyjyeackJV3F5r1xQP9XHdqOW6PBMHbdr5blP0BIIK9cMorp+P/pUPSHHtEYmHpvNquS4vWl8EqIHhBs27iOgJ7XFzsV3vHXRC1Tyf8ynbbqV/5QNRXHt84qG5iIdCPQw3aJd4aIOW6zKdrh+2vg4NO47BYEBl+mEU189n2HYrBxYPSHHtkUU81H/UeRyI80IdDDdo3lE/jIbNNCLioH5/2/XrblPetL4IUKMYNCQOmo8WGw9McW0PdptPjXmH5v7ieZ2Ih0IdDDdo3pV4aDOu4sYi7dETCOrmJnk+l9FihQekuLY/Kse5+BGBevjoapdhMw0QB22eOChUqh9Gz+d83rsJ/jgU1/YkJh+dN/mXz+lguS4eSlABww2a96ofRreJZ0octHk3u0153foiQI0iDur5nM9ptFbhgSmu7ZF4aDpny3V53voiQCUMN2ibeOh8iYO264NkB1TN8zmf6223cmDxSBTX9s9LRC7ioVABww2aZ9jMDImDNu8iBn8BlYmBQp7Puehf+ch++vjxY1N/4RpF3NDElTzO49YhsGf9ML7xste0v2+7lYmCM7Bcl+km4ju3Ipo17DbSAVCjuCnu+ZzPz9tupU/tI3JzrQ4X0WiQHE6jJwywf07k2iYeOh/iRm2T5IB6eT7nMyisPT7FtQrERCQvFXk8EQ+FOhhu0LwDBdb8lusyxY2OWl+Hhl3GoC+gMhEH9XzOR21hDxTXKrHblDc+EFM5jN4wwP4ZbtC2s34YxcmSijioA6t2vdc/EeoUN8PdfsrnMg6feWSKa3Up4qGpFPFQ2D/DDVCcSU3cqG3HkeAA6lPihjh5OLDYI8W1ioiHpvPEaQ7UYdutpg/0G9vRrK4fRi+TyYiDNu86khtAZfphfLFYLE7sSzqncejMHiiuVUY8NJ2j+DgA9s/ttbaJhyYiDtq8Dw6UoU4RB/V8zud6261et74I+6S4Vif9g3K5io8EYI8MN8Bt4lTEQdt2Kg4K1ToVB03ng0Pm/VNcq5B4aDqmh0I9HE607bAfRi+XlVuuywtx0Kbd7DbFexNUKG6An9mbdMq2W71rfRH2TXGtUrtNma50Xre+DomIh0IFDDdgesHsh9GwmUqJg+IAGarm+ZzPsO1Wbu5XQHGtbsduYKRyIR4K+2e4QfPcJq6b6XNtO99titsVUKEYDNTZm3QcWFRCca1i4qHpHBh9DNVwe61t4qEVijio6XPtGnab4j0JKhQ3vsVB87mMnsNUQHGtcuKh6ZzExwOwR4YbIB5aF3FQHHpA1Tyf83nvYkddFNdyOBUPTcX0UKiD4QZte2J6aFXEQdt2uduUN60vAtQobnof2px0TqPXMJVQXEsgelOoSudx4HQW9s9wA6ZhM/0wGjazZ+KgzXO7AioVN7z9+8znetutXre+CLVRXEtitykXGnSncrZcl+etLwLsm+EGTLeJ+2F0m3hPxEGZDjmijzBQn4u46U0eHxwe10lxLRfTQ3PxMQF18ALSNtND90sctG3X0T8YqEzc7D6yL+mUbbcydblCimuJiIem0y3XpmLBvhlugHjofsQNbnHQdn0w9R7qFDe6HTzlM2y7lX6ylVJcS0Y8NJ0pHmpaHeyf4QZciIc+Oh9ubSvioFCtK3HQlKQxKqa4lpNTwFx8XMCeGW5ARBPdJn4kcXO7a+Ivy+fcxIEwUJl+GF+Ig6Z0ue1Wpi5XTHEtoYiHnre+DokcLtfFRz3smeEGTBHF+KjgAUUc9MwaN817D1RIHDStDw4I66e4ltRu8+lEeGh9HRIp4qFQBR98mB768Hy4te18tylvW18EqJQhMzkdRwqDiimu5SYemodpdVABww0QD31Y4qDNex8HwEBl4ua2ITP53Gy7lanLCSiuJRanguKheUzxUAVR2D/DDRAPfQDioDj4hao56M/H1OVEFNeSEw9N52K5LuJIsEeGGxA0W79/PtzadrnbFM22oUL9MIqD5nSx7VbvWl+ELBTX5kE1Ow/xUKiA4QZM0cX42OAeiIM2T7NtqFQ/jG4V5zRsu5XnaiKKazMQ8VA9hPI4Wq7Ly9YXASrg9hpn8dHBD4iBPf49te14tymabUOdHOzn5Hc1GcW1+Ziq2u9bX4RErsRDYb8MNyD46PhxV3Ezmzbd7DZFs22oUNzQdqs4n8tttxKzT0ZxbSbitFA8NI8n4hNQBcMNEA/9Act1mU7WD9P+BfhRmm1DpfphdKs4JzH7pBTXZiSayLqFkcfJcl1Mq4M9MtyAcBofIXyHiIP6AGhb2W2KZttQJ7eKczqO91OSUVybH/HQXMRDYc8MN8CwmTvz4da2Ybcppu5ChfphdKs4p5tttxKzT0pxbWbEQ9M5cOoPVXB7jcP4GOEWxEHxvgl1ipvYvi/yEbNPTnFthiIeet36OiQiHgp7ZrgBoYiHfps4KIvF4jym1QP1uXCrOKWLbbcSs09McW2+jjXpTkWsAvbPcAPEQ29HHLRt7723QJ36YXy5WCyObE86w7ZbObRKTnFtpsRD0+mW6+KBCntkuAFhiof6/fyC5boci4M27zjeM4GK9MP41AFRWt4/Z0BxbcZ2m/JaPDSVs+W6PG99EWCfDDcgXMRHCn8QA3jcWGrbr9F+BKiPW8U5XW67lefqDCiuzZ94aC5Om2D/nB4iHvp5Ptza9sHzEerUD+MLcdCUPuhhOh+KazMnHppOFxPYgD0x3IBwFL1r+NetNX18OBUHhfqIg6Z2HG1JmAHFtQZEPFTMKY8Sk9iA/THcgMmVeOj/xEF9uLXtZrcp/huAOk3vLAf2Jp2bbbd63foizIniWjvEQ/MQR4I9M9yA8ESPsU/EQdv2QQoC6hRx0BPbk47n6gwprjVitynv5LlTORQPhf0y3IDwKj5emiQOylRgjvdIoD4O5HO62HYrz9WZ+enjx4+tr0FTlutPE56M0M9hOtF4pr8J7E8/jNME33/agua9XywWz1vrixJx0HdurTVt2G1MMoca9cM4XZw4sznpDNtu5bk6Q26utUc8NA/xUNgzww0IB43e/hYHRWwJKhSHfwprOUknzZTiWmPEQ9M5ikgOsD+GGzA5aSkeulyXF+Kgzbvcbcrb1hcBKuUAPqfLbbd60/oizJXiWoN2m3Khj1AqVxHNAfbAcAP+oInpoaaDElFoh7FQoYiDdvYmnQ+eq/OmuNYuH4p5iIfCnhluQDho5PezxN+Vdh3r+Qr16Yfxme+4tI5b693aGsW1RsU1//PW1yGRo4joAPvjZZbJWfS6maX4rTmx00273m2K2NL/397dHMeRZGsCzRrrfdUm18VRIIIjAWvWaWnkSNB4EhAtAR0SPECCR0rQhIXFupkSPEZKQKxj05AAY8F29kNV8QdI5I/f8HOWbdZmRXcyMuK6f/dCmfTCjGnTt8372hdh7hTXKjZ2aTqZHmpfh0DEQ+GEDDfgnlneJhYHJceWDDGAAq2G7XTI98LehOO5WgnFNfxDj6PWaXVQEsMNmLS5583ciIOSxEGhPDkO6jsgpsu+bT7Vvgg1UFyrnHhoOK/FQ+F0DDfgnlnFQ8VBmWJLeegVUJ5LcdCQbvq2URSthOIa4qHxiOzACRluwD2zKESIg5JJM0CBVsP21dR/2d6E5LlaEcU1vnATI45fl+vkBAROyzOTyYvcAye6c3HQ6l2MXRJbgsKshq3Dj7je9W1jOExFFNf4LE+F0qg7jjfLdZrttDooneEG3JNyL5yQ8m/JGxtatSGnGIDymA4a062D2PoornHf9GJ1Y0XCcIoFp2W4AYv80RP5eey3BB+AUKDVsP1NHDSs89ynl4oorvFveTqUXHgcrXgonI7hBtwTMh6af0PaAv5TOJ2rnF4ACiIOGtom9+elMopr/I54aDjny3UKG0eC6Aw34J5Q8VBxUHJawSEdlCnphRmWyyqVUlzja8RD44geR4I5cHuNRX4eR5oe6reD85xaAAqS46Cv7UlIF33bGA5TKcU1/iS/aPlYjOPFcp3sF5yI4Qbc83I1bF+VviDioCwWi+uxS+8tBBTJ4UdMN33buA1cMcU1viq/cF1bnTCSeCiclOEGfPE298opkjgopthBuVbDVhw0LnHQyv2l9gXgu6YHxCfjn0P4Eg/9rfaFgFOYhhvkhvb/ZQNCmIoLH7/xHzr971+Lyv3ze/+fQFPB3IggjV0SW4LCrIatw4+43vVtYzhM5X66u7urfQ34juU6TfGWv1ujMP6fmAeczmrYTi9WL2zBzmoueh1cbiHwnzP/Y/J9m7FLDuKgQKth+1FkP6Tp3eWZ9w0U1/ih5fpzseallQrh88Ndg2I4jXzq/N8zXH5Fr+By64CPbqNX7/+MXfrWv0vgRHIc1K21mP4jT4+ncmKhPIR4aBxf4qHFN9SGOZqGG6yG7dURp3wpevFQb/2OV+9CYQ3Ksxq2z/RBDGujsMYXbq7xIMt1OtNLKBTxUDiR3Mz+Yz6U+BpFL45KHJRpit3YGXwEJdJSIrT/3beNHpZ8prjGgy3XyYM/jpvFYvFcPBSgbuKgZP937JJm21CYPAzJ4UdMF33bpNoXgf/xv6wFj3CWI0iUbxrh7WEPgDgoVwprUJ4cB/W+HtONwhp/pLjGg+Wx7R4icbxerk0EA6hVjoO6cV63W+9uUKxLhx9hndW+APyZWCiPJh4aingoQIXEQcn0YIUCrYbtNHzs7/YmpHd92yiu8SdurrEL8dA4xEMB6iQOykZhDcqTBx+ZMBnTrcmufIviGo8mHhrOFA99XvsiANRiuU6v3DCv3q3YEhTL4Udc56a38y2Ka+xk7NLUI2CwemE4HQOowHKd3IhgkvJhKFCQ1bCd+iG/tCchbfq28fvKNymu8RRORONol+vktiHA/LkRwZAPQYGCiIOG59uX71JcY2djl6ZGyRdWMIw34qEA85XjoG5E4AMQypRyP2Tiuejbxm1gvktxjScZu8+3ocRD43CSDTBD4qBkF/nwEyhIjoO+tich3fRtIwHEDymusQ9OSON4sVwnE24A5kcclBuHaFAs/zbj8q3Lgyiu8WTioeGk5To9q30RAOZCHJTsbOySKXZQmNWwnW49tfYlpHd923yofRF4GMU19iLHQ2+sZgg/iw4BzIM4KNm7sUs+AKEwq2E79Tt+Y19Cul0sFhI/PJjiGvvkymwcUzzUfgHEdykOWj0fgFAuhx9xnfdt4zYwD6a4xt7kE9MrKxrGZb7xAEBAy3WaGmT/1d5V71wcFMqzGrbn4qBhbfq2URjlURTX2Dfx0DjEQwGCEgcl24xd8vcACrMats/ydxExSfjwaIpr7FU+OfUwiuNlboQNQCzTR9uv9qxqt965oFgmOMd10bfNp9oXgcdTXGPvxEPDeSseChBHjoO+tmXVuxy75AMQCpPjoC/sS0g3uZcpPJriGoeS8okq5fvZjwhADOKgZEOe1A4UZDVsfxEHDe3MEAN2pbjGQYiHhvPXfBMCgLKJg7LwjgXFEgeN67pvmw+1LwK7U1zjYMYuvZ8eUlY4DPFQgIKJg5JdjV36aDGgLKthO/UxfmlbQtLDkidTXOPQzsRDw/jVNXaAMomDkt34rYby5DioZ3RcSRyUp1Jc46DEQ8N5LR4KUKRzcVCmd6r8bgWU5VIcNKxN3zb6T/NkimscnHhoOH5cAAqyXKfni8XijT2p3nWeyA4UZDVsp4Ppv9qTsM5rXwD2Q3GNYxEPjaNdrk0gAyiIqBH6AUGBxEHDu+jbRg9L9kJxjaPIEQYFmzje5JsSAJxQPuxo7UH1kjgoFMkE57huJHbYJ8U1jmbs0vTw2ljxMJzCAZyQOCjZJr9DAQXJcVATnOM6M8SAfVJc49jEQ+OY4qF6EACcjkMOFuKgUCxF77iu+7bRw5K9UlzjqMYufRIPDSUt1+lZ7YsAcGzioGQX+d0JKMhq2HpGx6WHJQehuMbRiYeG8rObEwDHJQ5KNoydAUNQmtWw9YyOLYmDcgiKa5yKeGgcL8RDAY5K1IiJ314ok4PnuDZ92/iN5SAU1ziJHHHwYItDPBTgCPJhxgtrXb2rsUv6AUFhVsP2XBw0NIcWHIziGieTow6DHQjhZ8VQgMPKhxhigNz6ewDlWQ1bz+jYLvq2+Vj7InA4imucmmaScbxcrtOr2hcB4IDe5sMM6nY2dkk/ICiPZ3RcNy4KcGiKa5zU2KXp9ODCLoTxdrlOv9S+CAD7Jg5Kdj126b3FgLLkOKhndFxnhhhwaIprnJx4aCimhwLsmTgo2a1+QFCe1bD9xTM6tOu+bfSw5OAU1yiFeGgcUzz0t9oXAWCPRI2YpDzwCSiLZ3Rct74zORbFNYogHhqOeCjAHoiDkm3GLukHBIVZDdup3/BL+xJWEgflWBTXKMllbjZJ+X51PR7gacRBuUccFAqT46DaocS16dvGoQVHo7hGMfJkLNd243gtHgrwJJeiRkw39/MNfqAsntGxObTgqH66u7uz4hRluf4ci3htV0KYbho+z4VRAB5ouU5T1Ojv1qt6N2P3+QYjUJDVsJ0OkP9hT8K66NvGzXCOys01SpTEQ8P41akQwOPknpWiRizc2IfyiIOGd5NvHcJRKa5RHPHQcN4s1+l57YsA8AgmzzF5N3bpg5WA4qR8gExMZ4YYcAqKaxQpv2y+szthON0DeIAcBzV5jls3v6E8OQ6qPU1c133bOLTgJBTXKNl5fvmkfO1ynfQ1APgOcVDuOdOvFIokThjXrfQTp6S4RrHEQ8OZ4qGaMgN8mzgok83YpfdWAsqyGrbTQXFrW8JK4qCckuIaRcsvn9d2KQw3MgC+QhyUzM0KKNBq2E79g9/Ym7A2fdu4dchJKa4RwZl4aBgvluukhwzAPeKg3JPGLn2yIFAcz+jYfH9wcoprFE88NJwkHgrwO0kclMViMYxdcrMCCrMatufioKFd9W3zsfZF4PQU1whBPDSUn53+AfzLcp1MnuMLB4VQmNWwfZYPQIjpxv5RCsU1IjE9NI4Xub8QQLXEQbnnYuySmxVQHoNmYjs3xIBSKK4RRu5R4mQijrf5wxKgVtNv1q92v3rTzQpxUChMjoO+sC9hXfdtY/IyxVBcI5Tcq2Rj10IQDwWqJQ7KPWe5fyxQiNWw/cWhfWi3hhhQGsU1IjI9NI6X4qFAbcRBued67NIHCwLFEQeNLfVtY/IyRVFcIxzx0HDEQ4HaiIOyyAeBhhhAYVbDdjr4fWlfwhr6thG1pziKa4QkHhrKz4qhQC3EQbnnXBwUypLjoG4Wx+bQgiIprhGZB2scr/MHJ8Dc+Whjshm75O8ClOdSHDS0q75tTF6mSIprhJXjoRd2MAzxUGDWluskDspCHBTKtBq200HvX21PWDfSMJRMcY3Qxu7zh8xgF0P41Q8iMFfLdXq+WCze2GCmmzH5ABAohDjoLJz3bSNqT7EU15gDp8NxvM4foABz46ONyZAP/oCyuFkc23XfNu9rXwTKprhGeGOXPoqHhuIDFJiVHAdt7SoO/KA8OQ5q0ExcU9T+vPZFoHyKa8yCeGgobf4QBQhPHJR7rvKBH1CWS/sRWurbRtSe4imuMSdOi+N4Ix4KzITbuCw02oYyrYatm8WxDX3bKI4SguIas5FPi6/saBh+KIHQxEG553zskkbbUJDVsHWzOD6XJwhDcY25Sfn0mPK9WK6T/glASMt1euajjex67JJG21AeB7mxXfVtI2pPGIprzEo+NXbCEUfKH6gA0YiDssiNtr13QGFWw3Y6wH1hX8IStSccxTVmZ+zSB/HQMH72gQpEk2/d+mhjksRBoSyrYftMYSa8875tPFsJRXGNuRIPjUM8FAgj37b10cZkM3ZJ7AzK8zYf4BLTdd82ovaEo7jGLImHhjPFQ3+pfRGAEHy08YX3DCjMatieuVkc2hS1d+hOSIprzFaOh17b4RDEQ4HiiYNyz8XYpU8WBMqxGra/GGIQXurbxrOVkBTXmLuzfAJC+V4u1+mVfQJKJA7KPcPYJX8XoDxuFsc29G2jOEpYimvMmnhoOG/FQ4FC+WjjC5ElKMxq2E4HtC/tS2i+2QhNcY3ZG7v0Xjw0jJ9d5wdKIw7KPVe57QRQiBwH1V4ktqu+bT7WvgjEprhGLcRD4/jrcp1+q30RgDLk27QigCzye4S/C1Ce5GZxaDeercyB4hpVEA8NRzwUKIU4KF+c5fcJoBCrYTsdyL62H6Gd923j2Up4imtUI8dDN3Y8hF+dYAGnloes6OHD5Dq/RwCFEAedheu+bTxbmQXFNWojHhrHa/FQ4FTy7VkfbSzye4MhBlCelA9kicmzlVlRXKMqY5c+uREVig9b4FTEQfki5fcHoBCrYftcHDS81LeNZyuzobhGdcYuXYqHhvHrcp0UQ4GjEgflnk1+bwDK4gA2tqFvG89WZkVxjVqJh8bxZrlOz2tfBOA4xEH5A5ElKMxq2E4Hr619Cc2zldlRXKNK4qHh+NAFjkUclC8uxi59tBpQjhwHfWNLQrvq2+ZD7YvA/CiuUS3x0FBa8VDg0MRBuedm7PzuQIFECWO7dcGBuVJco3auJMdxvlynZ7UvAnAYOQ7qo40vzqwElGU1bKf39he2JbSzvm3+WfsiME+Ka1Qtxz0ual+HIH4WDwUOaDpJ/9UCs1gs3o1dElmCgqyG7TM3nsLb9G3zvvZFYL4U16hejn0Mta9DEC+W6+S2IbBXy3X6bbFYvLaq5MiS3xkoj36Ysd26EczcKa7Bv3jYx5HEQ4F9MR2UPzgbuySyBAVZDdszcdDwLvu2+VT7IjBvimsgHhrNz/oiAXskDsoXm7FLIktQkNWw1Q8zvqFvG5FeZk9xDbIcD72xHiG8zFP9AHYmDso9IktQJnHQ+ETtqcJfbDP8zvRi/Q9LEsLb5To5yQSeQjGFL9LYJZElKMhq2E4HqS/tSWhXfdsYEEMVfrq7u7PTcE8u2LjJAAB1GMYuPbfXUI4cB/3k1lpo043gZ33b6GNJFcRC4c/EQwGgHm4wQnmSwlp4Zwpr1ERxDf4gTwnzog0A83eRhxoBhVgNW/0w49v0bWNADFVRXIOvGLs09Qa4sjYAMFs3phBCWXIc9K1tCc2AGKqkuAbfJh4KAPN1lm+rA+WY3r9/tR+hXfZtY0AM1THQAL5juU7TlKK/WyMAmJXrsfv8Gw8UYjVsp8Ei/20/Qhv6tjEghiq5uQbfMXZp6hVwbY0AYDZElqBM4qDxnde+ANRLcQ1+7Cy/iAMA8Z2Lg0JZVsN2ioO2tiW0q75tPtS+CNRLcQ1+wPRQAJiNzdglt2OgIDkO+saehHab++VBtRTX4AHEQwEgPHFQKJOpvfGd9W3jRjBVU1yDhxMPBYC4LscumWAHBVkN26lH1wt7Etqmb5v3tS8CKK7BA+V4qCadABDPMHZJZAkKshq2z0QJw3MjGDLFNXiE3KdlY80AIBQff1Ce6b36Z/sS2mXfNm4EU73JX6wCPNr0gv7RywAAhHA1dumjrXqc3GT+l0j/zYTymzhoeEPfNm4eQqa4Bo809WtZrj9HS/7T2gFA0W7EznY2Rfb+HvS/HTg87XLgHrFQ2MHYpUvxUAAo3nnumcoj5Qbl76wb8BVXfdt8sDDwPxTXYHemhwJAua7HLplg9zTTzZQh8h8A2LtbN4LhzxTXYEd5nL8fFgAojwl2e9C3zT8dJgJ/cJafDcA9imvwBDke6kQXAMqSxEH3o2+bjw4TgWyTI+PAHyiuwdM5GQeAcmzy4Rd70rfNtJ7X1hOq5kYwfIfiGjxRHu9/YR0BoAg+/g7jLE9fBep02bfNJ3sPX/fT3d2dpYE9WK4/F9laawkAJ3MxdkmE8UBWw/a3xWLxj1n+4YDvuenb5pkVgm9zcw32x0k5AJzOjcLaYfVt88FtfaiS7xz4AcU12BPxUAA4KR9/R9C3zVTA3Mz+Dwp88S4X1oHvUFyD/brUjwQAju5q7JKPv+N5lZubA/M2/Ts/t8fwY4prsEd57L+TcwA4nunjTxz0iPq28b4DdTjP/96BH1Bcgz3LJ+dX1hUAjuIsH25xRH2acp/9AAAJ20lEQVTbvPe+A7O26dvmrS2Gh1Fcg8NI4qEAcHDXY5feW+bT6NtmiosNNf7ZoQJup8IjKK7BAYiHAsDB6QVUBv3XYH4u+rb5ZF/h4RTX4EDEQwHgoNLYJR9/J5Y/wBU5YT5u8lRg4BEU1+CwktNcANi7zdilS8tahtyX6V3t6wAzIX0DO1BcgwMSDwWAg3BTqjz6r0F87/q2+WAf4fEU1+DAcqPla+sMAHtxMXbpo6UsS982DhQhNn0s4QkU1+A4zsRDAeDJpknc4qCF6ttmKnr+rfZ1gKDOc5Ec2IHiGhyBeCgA7MVZ/k2lUH3bXLqxD+Fscu9EYEeKa3Ak4qEA8CTv8iRuyufGPsTiEgA8keIaHJeXTQB4PL2AAsnRsle1rwMEcdG3zSebBU+juAZHlKMsyZoDwKOIgwaTJw5e1L4OULibvm18m8AeKK7BkY1dmnqRbKw7ADzIJrdWIJj80e6dB8olDgp7orgGpyEeCgA/duvjLzzvPFCmd/mGKbAHimtwAmOXPomHAsAPpfybSVC5l5MCKZRFH0vYs5/u7u6sKZzIcv156tkL6w8AfzKMXXpuWeZhNWynthiva18HKMR/9G3z1mbA/ri5BqclKgEAX+e204z0bTPdkhlqXwcowEZhDfZPcQ1OKEddLu0BAPzO1dilj5Zkdhwqwuk5uIADUFyDExu7lJzkAsC/3ehLOk9923zU5wlO6iL3QQT2THENyuAECQD+5Wzs0j+txTzlONq72tcBTuCmbxsHF3AgimtQgBx9ubAXAFTueuw+D/th3s7zDUXgeBzmwwEprkEhxEMBqNytj7869G0z3Ux8Vfs6wBG969vGwQUckOIalMVHBQC1OhcHrUfuv/a32tcBjuBWr0M4PMU1KEiOh17ZEwAqsxm79Nam16Vvm2li+qb2dYADO8+3RYEDUlyD8iR9SACoiDho3V7lvwPA/m3yEBHgwBTXoDA5EuMjA4BaXI5d+mS366T/GhyUbwo4EsU1KFCelCYeCsDcDXmgDxXLjdZNTYf9uujbxsEFHIniGpRLPBSAudNkm8/6tjE1HfZn+oa4tJ5wPIprUCjxUABm7irf1IYv9F+D/TgzxACOS3ENCpY/Ot7ZIwBm5ibf0IZ/yxE2B4vwNNc5ag0ckeIalO/cKS4AM3Oeb2jD7/Rt817fWdiZ6ctwIoprUDjxUABm5nrs0nubynfovwa7SeKgcBqKaxBA/gi5tlcABOdWBT+UiwNnbu7Do2z6tjHEAE5EcQ3i8JIJQHRJHJSH6Nvmo2my8Cj+vcAJKa5BEOKhAAS3GbvkVgUP1rfNWzf34UEuckEaOBHFNQhEPBSAwBwQsYuzPF0W+Lrp34eDCzgxxTWIx/RQAKK5GLv0ya7xWLn/2isLB990ZogBnJ7iGgSTP06SfQMgiJuxS3632FmOu11YQfiT675tPlgWOD3FNQgo96zZ2DsAAhAH5cn6tknefeB3TF+GgiiuQVymhwJQuquxS25VsC+vvPvAvyVxUCiH4hoEJR4KQOFu/U6xT/qvwb9t+rYxxAAKorgGgYmHAlCws7FLblWwV7m/1JVVpXLntS8AlEZxDeLTawGA0lyPXXpvVziEvm2mwsJgcanURR7yARREcQ2Cy/FQE7QAKMWtWxUcgf5r1OhmsViIg0KBFNdgBsYuJSe4ABQi5YMfOJi+bT65vU+FzgwxgDIprsF8eMEE4NQ2uR8oHFzfNlP0+J2VphLXuecgUCDFNZiJsUsfxUMBODFxUI5N/zVqcOsgHcqmuAYzIh4KwAld5IMeOJockTvTf42ZS+KgUDbFNZgftwYAODZNtjmZPDkx2QFmatO3jecrFE5xDWZm7NLUi+HKvgJwRGdjl9yq4GRy8eHaDjBDDs4hAMU1mKeUbxEAwKG9ywc7cGpn3n+YmYt8MxMonOIazFC+PaDpKQCHdutWBaW4138N5kDcHgJRXIOZEg8F4AjEQSlK3zYfTE9nJs4MMYA4FNdg3sRDATiUzdil91aX0vRtM73/bGwMgV3nQjEQhOIazJh4KAAHcuv3hcK9yn9PIRrPVwhIcQ1mLsdDTc8CYJ/S2KVPVpRS6b9GYEkcFOJRXIM6nDm9BWBPhrFLmmxTvL5t3us/SzBD3zaerxCQ4hpUQDwUgD3ye0IYfdtM02wHO0YQnq8QlOIaVCI3nRYPBeAprsYufbSCBKP/GhFc9W3j+QpBKa5BXcRDAdjVTZ5CDaH0bTP1Bzy3axTM8xWCU1yDioiHAvAEZ/l3BMLp2+btYrF4Z+co1LkhBhCb4hpUJsdDN/YdgEe4ztOnITL91yjRdR6+AQSmuAZ1Eg8F4KFu3XpmDvLNIH+XKcmtyDLMg+IaVGjs0id9HQB4oHNxUOYiN4z/mw2lECn3BASC++nu7s4eQqWW688Rnxf2H4Bv2Ixd+s3iMDerYTvF8F7aWE5o6NvmuQ2AeXBzDeomHgrA94jQMVfegTg1z1eYEcU1qJh4KADfcZF/J2B2cv+1V3aWE7nKEWVgJhTXoHJjly5NzgLgD4axSw5fmLW+bab2GBd2mSO7cbgN86O4BixcSwfgD0yvowp920xFjo3d5ojO881JYEYU14Dp9tpHJ7cAZFdj93ngDdRC/zWO5bpvm/dWG+ZHcQ34LMd/xEMB6iauRHX6tvnkFj9HcOtWMMyX4hpwnxdLgLqdj10SV6I6+TbRlZ3ngFIu5AIz9NPd3Z19Bf5tuf58g+2NFQGozvXYJdMTqdpq2E6tMtra14G9G/q2eW5ZYb7cXAN+J8dDb6wKQFVu3V6Gz/Rf4xA8X2HmFNeAr/ECAFCXJA4Kn+OhH/XFYs+u8t8rYMYU14A/yVPi9B0BqMNm7NKlvYZ/6dvm7WKxeGc52ANDYqASimvAt4iHAtTBLR34s3PvQezBed82bgVDBRTXgK/K8SDxUIB5uxi7JK4Ef5ALIgZ88BTXeQotUAHFNeCbxEMBZu0mD7EBviL3yfqbtWEHt24FQ13+Yr+BH5g+vJ4tFotfLBTArCiswQ/0bXO5GrbP87sQPNTbvm0+WS2ox093d3e2GwAAAAB2IBYKAAAAADtSXAMAAACAHSmuAQAAAMCOFNcAAAAAYEeKawAAAACwI8U1AAAAANiR4hoAAAAA7EhxDQAAAAB2pLgGAAAAADtSXAMAAACAHSmuAQAAAMCOFNcAAAAAYEeKawAAAACwI8U1AAAAANiR4hoAAAAA7EhxDQAAAAB2pLgGAAAAADtSXAMAAACAHSmuAQAAAMCOFNcAAAAAYEeKawAAAACwI8U1AAAAANiR4hoAAAAA7EhxDQAAAAB2pLgGAAAAADtSXAMAAACAHSmuAQAAAMCOFNcAAAAAYBeLxeL/A2SP2b+iiHyGAAAAAElFTkSuQmCC"/>
</defs>
</svg>
          </div>
            <h5 className="inkbot-welcome-screen-logo">
              Inkpaper</h5>
            <h1 className="inkbot-welcome-screen-title">
              Welcome </h1>
              <div className="inkbot-welcome-discover">
                Discover What this Add-in can do for you today!
                </div>
              <ul className="inkbot-welcome-pro-points">
              <li className="inkbot-welcome-point">Achieve more with Office Integration</li>
              <li className="inkbot-welcome-point">Unlock features and functionality</li>
              <li className="inkbot-welcome-point">Create and Visualize like a pro</li> 
              </ul>
              </div>

              <StartChattingButton state={this.state} setState={this.setState.bind(this)}></StartChattingButton>

          </div>
        }
        {!this.state.isPristine&&<>
        
        <div className="tab-list tab-list-blue">
          {/* <div className={(this.state.currentTab==0||this.state.previousCurrentTab==0&&this.state.currentTab==3)?"tab-list-item active":"tab-list-item"} onClick={()=>this.setCurrentTab(0)} >Draft</div> */}
          <div className={(this.state.currentTab==2||this.state.previousCurrentTab==2&&this.state.currentTab==3)?"tab-list-item active":"tab-list-item"} onClick={()=>this.setCurrentTab(2)}>Draft</div>
          <div className={(this.state.currentTab==1||this.state.previousCurrentTab==1&&this.state.currentTab==3)?"tab-list-item active":"tab-list-item"} onClick={()=>this.setCurrentTab(1)}>Review</div>
          <div className="tab-list-side-list">
            <div className="side-list-item feedback-button" onClick={()=>this.setState({...this.state, 
              userReaction:null,currentPopup:'feedback'})} >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" >
<rect width="20" height="20" fill="url(#pattern0)"/>
<defs>
<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
<use href="#image0_986_34010" transform="scale(0.0104167)"/>
</pattern>
<image id="image0_986_34010" width="96" height="96" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAAAXNSR0IArs4c6QAAAsVJREFUeF7tmUFOHDEQRe0NoIjJGZLjsIgU7onEEuVOrNJSIJs4amAkEMx02VPu72oeW8pV9ntd3bYnJ/6kBLK0OsUTAsQPAQIQICYgLk8HIEBMQFyeDkCAmIC4PB2AADEBcXk6AAFiAuLydAACxATE5ekABIgJiMvTAREE/Pk9FfE8Q5b/8nW3+IAvBswrR0CbfwS0cXMbhQA3lG2JENDGzW0UAtxQtiXqLsBSoG3qsUYd2qRY+Jy0C7IUiIWybbYIaOPmNgoBbijbEiGgjZvbKAS4oWxLhIA2bm6jEOCGsi0RAtq4uY0KIyDKrWrt+QYBbs/ycyIEOAOtTYeAWmLO8QhwBlqbDgG1xJzjNyvAmdMw6cLsgoYh5jwRBDgDrU2HgFpizvEIcAZamw4BtcSc48MI4C7ovflVf5RHAAJML5/NHsToADqADjAREAdt9hUk5tqtfJhtaDcC4sQIQICYgLg8HYAAMQFx+TAdoDqI1W4ra30iYIEYAl4A0QGf9CqCDqADDr4kP8XvAXRA7bYiWHyYXVAwrubpIsCMqk8gAvpwNWdFgBlVn0AE9OFqzooAM6o+gQjow9WcFQFmVH0CZQL6LOdt1pzTr4v7y5/5e36sqVdKOXuYppuU8o+acZ6xlhP4SVcRnpM9lqtWwgjw5/VsRsC8GKuEUeBvToBFwkjwNyngmITR4G9WwEcSRoTvKmCtj+2+jgXo/puQvqV/S7sd6/dj7XU+PUyKopaapZTzx2m6LSlfHYrPqdzN/1uKudjtrnPOfy11144ZVsAT2BP38iM/+XvRQws4RUIE+EO/gl6/Cmo7IQr8MAJqOiES/FACLBKiwQ8n4JiEiPBDCvhIQlT4YQW8lpBzPmu5rl57v3/4LDPKTBrmMR/Wnq8mxjxkWZY0/DnAsojIMQgQ20MAAsQExOXpAASICYjL0wFiAf8BUkimf6odWQQAAAAASUVORK5CYII="/>
</defs>
</svg>

            </div>
            <div className="side-list-item support-button" onClick={()=>{this.setState({
              ...this.state,
              currentPopup:'support'
            })}} >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="7.75" cy="10.75" r="0.75" fill="white"/>
<path d="M7.5 14C11.0899 14 14 11.0899 14 7.5C14 3.91015 11.0899 1 7.5 1C3.91015 1 1 3.91015 1 7.5C1 11.0899 3.91015 14 7.5 14Z" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 5.33532C6.16131 4.8901 6.47969 4.51467 6.89877 4.27553C7.31784 4.0364 7.81056 3.94898 8.28966 4.02877C8.76875 4.10856 9.2033 4.35041 9.51635 4.71147C9.82939 5.07254 10.0007 5.52952 10 6.00149C10 7.33383 7.94168 8 7.94168 8" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

            </div>
          <div className={"tab-list-item settings-button"} >
        <div className="settings-image" onClick={()=>{this.setState({
          ...this.state,
          currentPopup:'version'
        })}} >
          <img src={require('../../images/inkpaper-logo-small.png')} />
        </div>

</div>
</div>
          </div>
          <div className="sub-tab-container">
            <div className="mode-details">
            {(this.state.currentTab==2||this.state.currentTab==3&&this.state.previousCurrentTab==2)&&<div className="power-icon"><svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.0625 1H2.125C1.82663 1 1.54048 1.12643 1.3295 1.35147C1.11853 1.57652 1 1.88174 1 2.2V11.8C1 12.1183 1.11853 12.4235 1.3295 12.6485C1.54048 12.8736 1.82663 13 2.125 13H8.875C9.17337 13 9.45952 12.8736 9.6705 12.6485C9.88147 12.4235 10 12.1183 10 11.8V5.2L6.0625 1Z" stroke="#002F56" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.77778 4L3 8.2H5.5L5.22222 11L8 6.8H5.5L5.77778 4Z" fill="#FFD600" stroke="#002F56" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</div>}
{(this.state.currentTab==1||this.state.currentTab==3&&this.state.previousCurrentTab==1)&&<div className="power-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
<path d="M13.3538 5.14625L9.85375 1.64625C9.80728 1.59983 9.75212 1.56303 9.69143 1.53793C9.63073 1.51284 9.56568 1.49995 9.5 1.5H3.5C3.23478 1.5 2.98043 1.60536 2.79289 1.79289C2.60536 1.98043 2.5 2.23478 2.5 2.5V13.5C2.5 13.7652 2.60536 14.0196 2.79289 14.2071C2.98043 14.3946 3.23478 14.5 3.5 14.5H12.5C12.7652 14.5 13.0196 14.3946 13.2071 14.2071C13.3946 14.0196 13.5 13.7652 13.5 13.5V5.5C13.5001 5.43432 13.4872 5.36927 13.4621 5.30858C13.437 5.24788 13.4002 5.19272 13.3538 5.14625ZM10 3.20688L11.7931 5H10V3.20688ZM12.5 13.5H3.5V2.5H9V5.5C9 5.63261 9.05268 5.75979 9.14645 5.85355C9.24021 5.94732 9.36739 6 9.5 6H12.5V13.5ZM9.65375 10.4469C9.94883 9.97798 10.0608 9.4168 9.9683 8.87056C9.87578 8.32432 9.58525 7.83131 9.15222 7.48574C8.71919 7.14016 8.17402 6.96624 7.62087 6.99721C7.06772 7.02818 6.54536 7.26186 6.15361 7.65361C5.76186 8.04536 5.52818 8.56771 5.49721 9.12087C5.46624 9.67402 5.64016 10.2192 5.98574 10.6522C6.33131 11.0853 6.82432 11.3758 7.37056 11.4683C7.9168 11.5608 8.47798 11.4488 8.94687 11.1538L9.64625 11.8538C9.6927 11.9002 9.74786 11.9371 9.80855 11.9622C9.86925 11.9873 9.9343 12.0003 10 12.0003C10.0657 12.0003 10.1308 11.9873 10.1914 11.9622C10.2521 11.9371 10.3073 11.9002 10.3538 11.8538C10.4002 11.8073 10.4371 11.7521 10.4622 11.6914C10.4873 11.6308 10.5003 11.5657 10.5003 11.5C10.5003 11.4343 10.4873 11.3692 10.4622 11.3086C10.4371 11.2479 10.4002 11.1927 10.3538 11.1462L9.65375 10.4469ZM6.5 9.25C6.5 9.00277 6.57331 8.7611 6.71066 8.55554C6.84801 8.34998 7.04324 8.18976 7.27165 8.09515C7.50005 8.00054 7.75139 7.97579 7.99386 8.02402C8.23634 8.07225 8.45907 8.1913 8.63388 8.36612C8.8087 8.54093 8.92775 8.76366 8.97598 9.00614C9.02421 9.24861 8.99946 9.49995 8.90485 9.72835C8.81024 9.95676 8.65002 10.152 8.44446 10.2893C8.2389 10.4267 7.99723 10.5 7.75 10.5C7.41848 10.5 7.10054 10.3683 6.86612 10.1339C6.6317 9.89946 6.5 9.58152 6.5 9.25Z" fill="#002F56"/>
</svg>
</div>}
            <div className="mode-name">
              {/* {this.state.currentTab==0&&'Inkbot'} */}
              {this.state.currentTab==1&&'Examine'}
              {this.state.currentTab==2&&'Power Draft'}
              {this.state.currentTab==3&&this.state.previousCurrentTab==1&&'Examine'}
              {this.state.currentTab==3&&this.state.previousCurrentTab==2&&'Power Draft'}
            </div>
            </div>
            <div className="settings-sub-tab" onClick={()=>this.setCurrentTab(3)}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_986_34015)">
<path d="M7.5 9.375C8.53553 9.375 9.375 8.53553 9.375 7.5C9.375 6.46447 8.53553 5.625 7.5 5.625C6.46447 5.625 5.625 6.46447 5.625 7.5C5.625 8.53553 6.46447 9.375 7.5 9.375Z" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.8727 9.27273C11.7941 9.45095 11.7706 9.64866 11.8054 9.84035C11.8401 10.032 11.9315 10.2089 12.0677 10.3482L12.1032 10.3836C12.2131 10.4934 12.3002 10.6237 12.3597 10.7672C12.4192 10.9107 12.4498 11.0645 12.4498 11.2198C12.4498 11.3751 12.4192 11.5289 12.3597 11.6723C12.3002 11.8158 12.2131 11.9461 12.1032 12.0559C11.9934 12.1658 11.8631 12.253 11.7196 12.3124C11.5761 12.3719 11.4224 12.4025 11.267 12.4025C11.1117 12.4025 10.9579 12.3719 10.8145 12.3124C10.671 12.253 10.5407 12.1658 10.4309 12.0559L10.3955 12.0205C10.2562 11.8842 10.0793 11.7928 9.88762 11.7581C9.69593 11.7233 9.49823 11.7468 9.32 11.8255C9.14523 11.9004 8.99617 12.0247 8.89118 12.1833C8.78619 12.3418 8.72985 12.5276 8.72909 12.7177V12.8182C8.72909 13.1316 8.60458 13.4322 8.38294 13.6539C8.16131 13.8755 7.86071 14 7.54727 14C7.23383 14 6.93323 13.8755 6.7116 13.6539C6.48997 13.4322 6.36545 13.1316 6.36545 12.8182V12.765C6.36088 12.5694 6.29757 12.3797 6.18376 12.2206C6.06994 12.0615 5.91089 11.9403 5.72727 11.8727C5.54904 11.7941 5.35134 11.7706 5.15965 11.8054C4.96796 11.8401 4.79108 11.9315 4.65182 12.0677L4.61636 12.1032C4.5066 12.2131 4.37626 12.3002 4.23279 12.3597C4.08932 12.4192 3.93554 12.4498 3.78023 12.4498C3.62492 12.4498 3.47113 12.4192 3.32766 12.3597C3.18419 12.3002 3.05385 12.2131 2.94409 12.1032C2.83421 11.9934 2.74704 11.8631 2.68757 11.7196C2.62809 11.5761 2.59748 11.4224 2.59748 11.267C2.59748 11.1117 2.62809 10.9579 2.68757 10.8145C2.74704 10.671 2.83421 10.5407 2.94409 10.4309L2.97955 10.3955C3.11577 10.2562 3.20715 10.0793 3.24191 9.88762C3.27667 9.69593 3.2532 9.49823 3.17455 9.32C3.09964 9.14523 2.97526 8.99617 2.81673 8.89118C2.65819 8.78619 2.47242 8.72985 2.28227 8.72909H2.18182C1.86838 8.72909 1.56778 8.60458 1.34615 8.38294C1.12451 8.16131 1 7.86071 1 7.54727C1 7.23383 1.12451 6.93323 1.34615 6.7116C1.56778 6.48997 1.86838 6.36545 2.18182 6.36545H2.235C2.43059 6.36088 2.62028 6.29757 2.7794 6.18376C2.93853 6.06994 3.05974 5.91089 3.12727 5.72727C3.20593 5.54904 3.2294 5.35134 3.19464 5.15965C3.15988 4.96796 3.0685 4.79108 2.93227 4.65182L2.89682 4.61636C2.78694 4.5066 2.69977 4.37626 2.64029 4.23279C2.58082 4.08932 2.55021 3.93554 2.55021 3.78023C2.55021 3.62492 2.58082 3.47113 2.64029 3.32766C2.69977 3.18419 2.78694 3.05385 2.89682 2.94409C3.00658 2.83421 3.13692 2.74704 3.28039 2.68757C3.42386 2.62809 3.57765 2.59748 3.73295 2.59748C3.88826 2.59748 4.04205 2.62809 4.18552 2.68757C4.32899 2.74704 4.45933 2.83421 4.56909 2.94409L4.60455 2.97955C4.74381 3.11577 4.92069 3.20715 5.11238 3.24191C5.30407 3.27667 5.50177 3.2532 5.68 3.17455H5.72727C5.90205 3.09964 6.0511 2.97526 6.15609 2.81673C6.26108 2.65819 6.31742 2.47242 6.31818 2.28227V2.18182C6.31818 1.86838 6.44269 1.56778 6.66433 1.34615C6.88596 1.12451 7.18656 1 7.5 1C7.81344 1 8.11404 1.12451 8.33567 1.34615C8.5573 1.56778 8.68182 1.86838 8.68182 2.18182V2.235C8.68258 2.42515 8.73892 2.61092 8.84391 2.76946C8.9489 2.92799 9.09795 3.05237 9.27273 3.12727C9.45095 3.20593 9.64866 3.2294 9.84035 3.19464C10.032 3.15988 10.2089 3.0685 10.3482 2.93227L10.3836 2.89682C10.4934 2.78694 10.6237 2.69977 10.7672 2.64029C10.9107 2.58082 11.0645 2.55021 11.2198 2.55021C11.3751 2.55021 11.5289 2.58082 11.6723 2.64029C11.8158 2.69977 11.9461 2.78694 12.0559 2.89682C12.1658 3.00658 12.253 3.13692 12.3124 3.28039C12.3719 3.42386 12.4025 3.57765 12.4025 3.73295C12.4025 3.88826 12.3719 4.04205 12.3124 4.18552C12.253 4.32899 12.1658 4.45933 12.0559 4.56909L12.0205 4.60455C11.8842 4.74381 11.7928 4.92069 11.7581 5.11238C11.7233 5.30407 11.7468 5.50177 11.8255 5.68V5.72727C11.9004 5.90205 12.0247 6.0511 12.1833 6.15609C12.3418 6.26108 12.5276 6.31742 12.7177 6.31818H12.8182C13.1316 6.31818 13.4322 6.44269 13.6539 6.66433C13.8755 6.88596 14 7.18656 14 7.5C14 7.81344 13.8755 8.11404 13.6539 8.33567C13.4322 8.5573 13.1316 8.68182 12.8182 8.68182H12.765C12.5749 8.68258 12.3891 8.73892 12.2305 8.84391C12.072 8.9489 11.9476 9.09795 11.8727 9.27273Z" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_986_34015">
<rect width="15" height="15" fill="white"/>
</clipPath>
</defs>
</svg>

            </div>
          </div>
        
        
        <>
  
        
        
    {/* <div className={this.state.inkbotTab==0&&this.state.currentTab==0?'inkbot-chat-container tab-content show':'inkbot-chat-container tab-content'}  >
          <div className="inkbot-chat-items-wrapper">
            {this.state.chatItems.map((item,index)=>{
              return <ChatItem key={index} chatData={item} setResponding={this.setResponding.bind(this)}  />
            })}
          </div>
          <form className="inkbot-chat-input-wrapper" onSubmit={(e)=>this.handleSubmit(e)} >
              <input type="text" className="inkbot-chat-input" value={this.state.inputVal} onChange={(e)=>this.onChangeInput(e)}  placeholder="Type a message" />
              <button type="submit" className="inkbot-chat-submit"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_779_58)">
<path d="M11.9163 1.0835L5.95801 7.04183" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.9163 1.0835L8.12467 11.9168L5.95801 7.04183L1.08301 4.87516L11.9163 1.0835Z" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_779_58">
<rect width="13" height="13" fill="white"/>
</clipPath>
</defs>
</svg>
</button>
            </form>
        </div> */}
         
          {
           this.state.currentTab==2&&<SelectionBot setLoading={this.setAppLoading.bind(this)} />
          }
          
          {
            this.state.currentTab==3&&<div className="inkbot-configurations-container">
              {this.state.previousCurrentTab==0&&<div className="config-div">
                <label>Inkbot System Prompt</label>
                <textarea value={this.state.inkbotPrompt} onChange={(e)=>this.onChangeInkbotPrompt(e)} ></textarea>
              </div>}
              {this.state.previousCurrentTab==2&&<div className="config-div">
                <label>Selection Prompt</label>
                <textarea value={this.state.reviewPrompt} onChange={(e)=>this.onChangeReviewInput(e)}></textarea>
                </div>}
              {this.state.previousCurrentTab==1&&<div className="config-div">
                <label>Review Prompt</label>
                <textarea value={this.state.documentString} onChange={(e)=>this.onChangeDocumentString(e)}></textarea>
                </div>}
            </div>
          }
          
          </>
          
    <div className={this.state.currentTab==1?'inkbot-chat-container tab-content show':'inkbot-chat-container tab-content'}  >
          <div className="inkbot-chat-items-wrapper">
            {this.state.reviewItems.map((item,index)=>{
              return <ChatItem key={index} chatData={item} bottomEl={this.bottomEl.current} isBottomVisible={this.state.isBottomElVisible} setResponding={this.setResponding.bind(this)}  />
            })}
            <div className="bottom-el" ref={this.bottomEl} ></div>
          </div>
          <form className="inkbot-chat-input-wrapper" onSubmit={(e)=>this.handleReviewSubmit(e)} >
              <input type="text"  className="inkbot-chat-input" value={this.state.reviewInputVal} onChange={(e)=>this.onChangeReviewInput(e)}  placeholder="What is this document about?" />
              <button type="submit" className="inkbot-chat-submit"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_779_58)">
<path d="M11.9163 1.0835L5.95801 7.04183" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.9163 1.0835L8.12467 11.9168L5.95801 7.04183L1.08301 4.87516L11.9163 1.0835Z" stroke="white" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_779_58">
<rect width="13" height="13" fill="white"/>
</clipPath>
</defs>
</svg>
</button>
            </form>
        </div>
              
          
        </>
        }
       {this.state.currentPopup=='feedback'&&<div className="popup feedback-popup">
          <div className="popup-content">
            <div className="popup-header">
              <div className="popup-title">How satisfied are you with using <b>Inkpaper?</b></div>
              <div className="popup-close" onClick={()=>this.closePopup()} >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L14 14" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 1L1 14" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </div>
                </div>
                <div className="popup-body">
                 <div className="feedback-reactions">
                  <div className="feedback-reaction feedback-reaction-bad" onClick={()=>this.setReaction(-1)} >
                 {this.state.userReaction!=-1&&<svg width="39" height="40" viewBox="0 0 39 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.478 16.7374C23.6225 15.8039 23.6225 14.2904 24.478 13.3569C25.3335 12.4233 26.7205 12.4233 27.576 13.3569C28.4315 14.2904 28.4315 15.8039 27.576 16.7374C26.7205 17.6709 25.3335 17.6709 24.478 16.7374Z" fill="#404041"/>
<path d="M11.1837 15.4321C10.9899 14.129 11.8008 12.9012 12.9951 12.6896C14.1893 12.4781 15.3145 13.363 15.5084 14.6661C15.7022 15.9692 14.8913 17.1971 13.697 17.4086C12.5028 17.6202 11.3776 16.7353 11.1837 15.4321Z" fill="#404041"/>
<path d="M13.9572 31.1288C14.3317 31.1288 14.7056 30.973 14.9918 30.6614C16.4506 29.0703 18.3902 28.1935 20.4525 28.1935C22.5149 28.1935 24.4545 29.0695 25.9126 30.6606C26.4844 31.2838 27.41 31.2838 27.9818 30.6606C28.5529 30.0374 28.5529 29.0266 27.9818 28.4027C25.9712 26.2087 23.2971 25 20.4525 25C17.608 25 14.9346 26.2087 12.9233 28.4027C12.3515 29.0259 12.3515 30.0367 12.9233 30.6606C13.2088 30.9722 13.5834 31.1288 13.9579 31.1288H13.9572Z" fill="#404041"/>
<path d="M19.5 40C30.2523 40 39 31.028 39 20C39 8.97198 30.2523 0 19.5 0C8.74769 0 0 8.97198 0 20C0 31.028 8.74769 40 19.5 40ZM19.5 2.68099C28.8111 2.68099 36.386 10.4501 36.386 20C36.386 29.5499 28.8111 37.319 19.5 37.319C10.1889 37.319 2.61397 29.5499 2.61397 20C2.61397 10.4501 10.1889 2.68099 19.5 2.68099Z" fill="#404041"/>
</svg>
}

{this.state.userReaction==-1&&<svg width="39" height="40" viewBox="0 0 39 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="20" r="19" fill="#FF4646"/>
<path d="M24.478 16.7374C23.6225 15.8039 23.6225 14.2904 24.478 13.3569C25.3335 12.4233 26.7205 12.4233 27.576 13.3569C28.4315 14.2904 28.4315 15.8039 27.576 16.7374C26.7205 17.6709 25.3335 17.6709 24.478 16.7374Z" fill="#404041"/>
<path d="M11.1837 15.4321C10.9899 14.129 11.8008 12.9012 12.9951 12.6896C14.1893 12.4781 15.3145 13.363 15.5084 14.6661C15.7022 15.9692 14.8913 17.1971 13.697 17.4086C12.5028 17.6202 11.3776 16.7353 11.1837 15.4321Z" fill="#404041"/>
<path d="M13.9572 31.1288C14.3317 31.1288 14.7056 30.973 14.9918 30.6614C16.4506 29.0703 18.3902 28.1935 20.4525 28.1935C22.5149 28.1935 24.4545 29.0695 25.9126 30.6606C26.4844 31.2838 27.41 31.2838 27.9818 30.6606C28.5529 30.0374 28.5529 29.0266 27.9818 28.4027C25.9712 26.2087 23.2971 25 20.4525 25C17.608 25 14.9346 26.2087 12.9233 28.4027C12.3515 29.0259 12.3515 30.0367 12.9233 30.6606C13.2088 30.9722 13.5834 31.1288 13.9579 31.1288H13.9572Z" fill="#404041"/>
<path d="M19.5 40C30.2523 40 39 31.028 39 20C39 8.97198 30.2523 0 19.5 0C8.74769 0 0 8.97198 0 20C0 31.028 8.74769 40 19.5 40ZM19.5 2.68099C28.8111 2.68099 36.386 10.4501 36.386 20C36.386 29.5499 28.8111 37.319 19.5 37.319C10.1889 37.319 2.61397 29.5499 2.61397 20C2.61397 10.4501 10.1889 2.68099 19.5 2.68099Z" fill="#404041"/>
</svg>

  
}

                  </div>
                  <div className="feedback-reaction feedback-reaction-neutral" onClick={()=>this.setReaction(0)} >
                  {this.state.userReaction!=0&&<svg width="39" height="40" viewBox="0 0 39 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.1896 15.6387C22.9957 14.3356 23.8067 13.1077 25.0009 12.8962C26.1951 12.6847 27.3204 13.5696 27.5142 14.8727C27.7081 16.1758 26.8971 17.4037 25.7029 17.6152C24.5087 17.8267 23.3834 16.9418 23.1896 15.6387Z" fill="#404041"/>
<path d="M11.5569 15.8008C11.279 14.5159 12.0082 13.2285 13.1857 12.9252C14.3632 12.6219 15.5431 13.4177 15.821 14.7026C16.0989 15.9875 15.3697 17.2749 14.1922 17.5782C13.0147 17.8814 11.8348 17.0856 11.5569 15.8008Z" fill="#404041"/>
<path d="M13.4068 28H25.5932C26.3706 28 27 27.3281 27 26.5C27 25.6719 26.3699 25 25.5932 25H13.4068C12.6301 25 12 25.6719 12 26.5C12 27.3281 12.6301 28 13.4068 28Z" fill="#404041"/>
<path d="M19.5 40C30.2523 40 39 31.028 39 20C39 8.97198 30.2523 0 19.5 0C8.74769 0 0 8.97198 0 20C0 31.028 8.74769 40 19.5 40ZM19.5 2.68099C28.8111 2.68099 36.386 10.4501 36.386 20C36.386 29.5499 28.8111 37.319 19.5 37.319C10.1889 37.319 2.61397 29.5499 2.61397 20C2.61397 10.4501 10.1889 2.68099 19.5 2.68099Z" fill="#404041"/>
</svg>
                  }
                  {
                    this.state.userReaction==0&&<svg width="39" height="40" viewBox="0 0 39 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="19" fill="#FFD600"/>
                    <path d="M23.1896 15.6387C22.9957 14.3355 23.8067 13.1077 25.0009 12.8962C26.1951 12.6846 27.3204 13.5695 27.5142 14.8727C27.7081 16.1758 26.8971 17.4037 25.7029 17.6152C24.5087 17.8267 23.3834 16.9418 23.1896 15.6387Z" fill="#404041"/>
                    <path d="M11.5569 15.8008C11.279 14.5159 12.0082 13.2285 13.1857 12.9252C14.3632 12.6219 15.5431 13.4177 15.821 14.7026C16.0989 15.9875 15.3697 17.2749 14.1922 17.5782C13.0147 17.8814 11.8348 17.0856 11.5569 15.8008Z" fill="#404041"/>
                    <path d="M13.4068 28H25.5932C26.3706 28 27 27.3281 27 26.5C27 25.6719 26.3699 25 25.5932 25H13.4068C12.6301 25 12 25.6719 12 26.5C12 27.3281 12.6301 28 13.4068 28Z" fill="#404041"/>
                    <path d="M19.5 40C30.2523 40 39 31.028 39 20C39 8.97198 30.2523 0 19.5 0C8.74769 0 0 8.97198 0 20C0 31.028 8.74769 40 19.5 40ZM19.5 2.68099C28.8111 2.68099 36.386 10.4501 36.386 20C36.386 29.5499 28.8111 37.319 19.5 37.319C10.1889 37.319 2.61397 29.5499 2.61397 20C2.61397 10.4501 10.1889 2.68099 19.5 2.68099Z" fill="#404041"/>
                    </svg>
                    
                  }
                  </div>
                  <div className="feedback-reaction feedback-reaction-good" onClick={()=>this.setReaction(1)} >
                  {
                    this.state.userReaction!=1&&<svg width="39" height="40" viewBox="0 0 39 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.643 16.9442C22.7875 16.0107 22.7875 14.4972 23.643 13.5636C24.4985 12.6301 25.8855 12.6301 26.741 13.5636C27.5965 14.4972 27.5965 16.0107 26.741 16.9442C25.8855 17.8777 24.4985 17.8777 23.643 16.9442Z" fill="#404041"/>
                    <path d="M10.3546 15.6379C10.1608 14.3348 10.9717 13.1069 12.166 12.8954C13.3602 12.6838 14.4854 13.5687 14.6793 14.8719C14.8731 16.175 14.0622 17.4029 12.8679 17.6144C11.6737 17.8259 10.5485 16.941 10.3546 15.6379Z" fill="#404041"/>
                    <path d="M18.8358 30.7289C21.6797 30.7289 24.3531 29.5202 26.3651 27.3262C26.9369 26.703 26.9369 25.6922 26.3651 25.0683C25.794 24.4444 24.8677 24.4444 24.2959 25.0683C22.837 26.6594 20.8975 27.5362 18.8351 27.5362C16.7728 27.5362 14.8332 26.6601 13.3751 25.069C12.804 24.4459 11.877 24.4459 11.3059 25.069C10.7348 25.6922 10.7348 26.7038 11.3059 27.327C13.3165 29.5209 15.9906 30.7297 18.8351 30.7297L18.8358 30.7289Z" fill="#404041"/>
                    <path d="M19.5 40C30.2523 40 39 31.028 39 20C39 8.97198 30.2523 0 19.5 0C8.74768 0 0 8.97198 0 20C0 31.028 8.74768 40 19.5 40ZM19.5 2.68099C28.8111 2.68099 36.386 10.4501 36.386 20C36.386 29.5499 28.8111 37.319 19.5 37.319C10.1889 37.319 2.61397 29.5499 2.61397 20C2.61397 10.4501 10.1889 2.68099 19.5 2.68099Z" fill="#404041"/>
                    </svg>
                    
                  }
                  {
                    this.state.userReaction==1&&<svg width="39" height="40" viewBox="0 0 39 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="19" fill="#00B807"/>
                    <path d="M23.643 16.9442C22.7875 16.0107 22.7875 14.4972 23.643 13.5636C24.4985 12.6301 25.8855 12.6301 26.741 13.5636C27.5965 14.4972 27.5965 16.0107 26.741 16.9442C25.8855 17.8777 24.4985 17.8777 23.643 16.9442Z" fill="#404041"/>
                    <path d="M10.3546 15.6379C10.1608 14.3348 10.9717 13.1069 12.166 12.8954C13.3602 12.6838 14.4854 13.5687 14.6793 14.8719C14.8731 16.175 14.0622 17.4029 12.8679 17.6144C11.6737 17.8259 10.5485 16.941 10.3546 15.6379Z" fill="#404041"/>
                    <path d="M18.8358 30.7289C21.6797 30.7289 24.3531 29.5202 26.3651 27.3262C26.9369 26.703 26.9369 25.6922 26.3651 25.0683C25.794 24.4444 24.8677 24.4444 24.2959 25.0683C22.837 26.6594 20.8975 27.5362 18.8351 27.5362C16.7728 27.5362 14.8332 26.6601 13.3751 25.069C12.804 24.4459 11.877 24.4459 11.3059 25.069C10.7348 25.6922 10.7348 26.7038 11.3059 27.327C13.3165 29.5209 15.9906 30.7297 18.8351 30.7297L18.8358 30.7289Z" fill="#404041"/>
                    <path d="M19.5 40C30.2523 40 39 31.028 39 20C39 8.97198 30.2523 0 19.5 0C8.74768 0 0 8.97198 0 20C0 31.028 8.74768 40 19.5 40ZM19.5 2.68099C28.8111 2.68099 36.386 10.4501 36.386 20C36.386 29.5499 28.8111 37.319 19.5 37.319C10.1889 37.319 2.61397 29.5499 2.61397 20C2.61397 10.4501 10.1889 2.68099 19.5 2.68099Z" fill="#404041"/>
                    </svg>
                    
                  }
                  </div>
                  </div>
                  <div className="feedback-text">
                    <textarea className="feedback-textarea" value={this.state.userReactionText} onChange={(e)=>this.onChangeUserReactionText(e)} ></textarea>
                    <div className="selection-submit-button" onClick={()=>this.closePopup()} >Submit</div>  
                  </div> 
            </div>
          </div>
        </div>}
        {
          this.state.currentPopup=='support'&&<div className="popup support-popup">
          <div className="popup-content">
            <div className="popup-header">
              <div className="popup-title">Support</div>
              <div className="popup-close" onClick={()=>this.closePopup()} >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L14 14" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 1L1 14" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                </div>
                </div>
                <div className="popup-body">
                  <div className="support-text">
                    {/* create a mailto for support@inkpaper.ai */}
                    <div className="support-text-title">Email</div>
                    <div className="support-text-content">
                      <a href="mailto:support@inkpaper.ai">
                        support@inkpaper.ai
                        </a>
                      </div>
                    </div>
                    </div>
                    </div>
                    </div>
        }
        {
          this.state.currentPopup=='version'&&<div className="popup version-popup"  >
          <div className="popup-content">
            <div className="popup-header">
              <div className="popup-title">Version</div>
              <div className="popup-close" onClick={()=>this.closePopup()} >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1L14 14" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 1L1 14" stroke="#002F56" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
                </div>
                </div>
                <div className="popup-body">
                  <div className="version-text">
                    <img src={require('../../images/inkpaper-logo-small.png')} alt="" />
                    <div className="version-text-title">Inkpaper</div>
                    <div className="version-text-content">
                      Alpha
                      </div>
                    </div>
                    </div>
                    </div>
                    </div>

        }
      </div>
    );
  }
}
