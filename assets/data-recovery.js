(function(){
  "use strict";

  const recipient="1175365450@qq.com";
  const phone="4008779100";
  const params=new URLSearchParams(location.search);
  const lang=document.documentElement.lang.startsWith("zh")?"zh":"en";
  const sessionKey="dataRecoveryInquirySourceV1";

  function clean(value,limit){
    return String(value||"").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,"").trim().slice(0,limit);
  }

  function pagePath(){
    return location.pathname.replace(/\/index\.html$/,"/");
  }

  function pageCode(){
    const codes={
      "/":"DR-HOME",
      "/en/":"DR-EN",
      "/data-recovery-staging/":"DR-HOME",
      "/data-recovery-staging/en/":"DR-EN"
    };
    return codes[pagePath()]||"DR-WEB";
  }

  function sourceContext(){
    let first={};
    try{first=JSON.parse(sessionStorage.getItem(sessionKey)||"{}")}catch(error){first={}}
    if(!first.landing_page){
      first={
        landing_page:pagePath(),
        referrer_host:(function(){
          if(!document.referrer)return "direct";
          try{return new URL(document.referrer).hostname||"direct"}catch(error){return "unknown"}
        })(),
        utm_source:clean(params.get("utm_source")||"direct",100),
        utm_medium:clean(params.get("utm_medium")||"none",100),
        utm_campaign:clean(params.get("utm_campaign")||"none",150),
        utm_content:clean(params.get("utm_content")||"none",150)
      };
      try{sessionStorage.setItem(sessionKey,JSON.stringify(first))}catch(error){}
    }
    return first;
  }

  function caseReference(){
    const now=new Date();
    const pad=function(value){return String(value).padStart(2,"0")};
    const stamp=now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+"-"+pad(now.getHours())+pad(now.getMinutes());
    const random=Math.random().toString(36).slice(2,6).toUpperCase().padEnd(4,"0");
    return pageCode()+"-"+stamp+"-"+random;
  }

  async function copyText(value,button){
    const old=button.textContent;
    try{
      await navigator.clipboard.writeText(value);
      button.textContent=lang==="zh"?"已复制":"Copied";
    }catch(error){
      button.textContent=lang==="zh"?"请手动复制":"Copy manually";
    }
    setTimeout(function(){button.textContent=old},1800);
  }

  document.querySelectorAll("[data-copy]").forEach(function(button){
    button.addEventListener("click",function(){copyText(button.dataset.copy,button)});
  });

  const form=document.querySelector("#inquiryForm");
  if(!form)return;

  form.addEventListener("submit",function(event){
    event.preventDefault();
    if(!form.reportValidity())return;

    const status=document.querySelector("#formStatus");
    const data=Object.fromEntries(new FormData(form));
    if(data.website){
      status.textContent=lang==="zh"?"无法处理此内容。":"This content could not be processed.";
      return;
    }

    const context=sourceContext();
    const reference=caseReference();
    const source=[
      "source_code="+pageCode(),
      "utm_source="+context.utm_source,
      "utm_medium="+context.utm_medium,
      "utm_campaign="+context.utm_campaign,
      "utm_content="+context.utm_content,
      "referrer_host="+context.referrer_host,
      "landing_page="+context.landing_page,
      "form_page="+pagePath()
    ].join("\n");

    const safe={
      name:clean(data.name,100),
      contact:clean(data.contact,200),
      company:clean(data.company,200),
      device:clean(data.device,100),
      issue:clean(data.issue,100),
      request:clean(data.request,3000)
    };
    const subject=(lang==="zh"?"数据恢复咨询":"Data recovery inquiry")+" ["+reference+"]";
    const body=lang==="zh"
      ?["咨询编号："+reference,"称呼："+safe.name,"联系方式："+safe.contact,"公司："+(safe.company||"未填写"),"设备类型："+safe.device,"问题类型："+safe.issue,"","故障、数据和已做操作：",safe.request,"","来源标记：",source].join("\n")
      :["Inquiry reference: "+reference,"Name: "+safe.name,"Phone or email: "+safe.contact,"Company: "+(safe.company||"Not provided"),"Device type: "+safe.device,"Issue type: "+safe.issue,"","Symptoms, needed data and actions already taken:",safe.request,"","Source:",source].join("\n");
    const mailto="mailto:"+recipient+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);

    status.replaceChildren();
    const panel=document.createElement("div");
    panel.className="inquiry-ready";
    const heading=document.createElement("strong");
    heading.textContent=lang==="zh"?"咨询内容已整理，尚未发送":"Your inquiry is ready and has not been sent";
    const note=document.createElement("p");
    note.textContent=lang==="zh"
      ?"请在打开的邮件中点击“发送”。如果没有弹出邮件应用，请复制完整内容，手动发送到 1175365450@qq.com；也可直接拨打 400-877-9100，并报咨询编号。"
      :"Click Send in your email app. If no email app opens, copy the complete message and send it manually to 1175365450@qq.com. You can also call 400-877-9100 in mainland China and quote the reference.";
    const output=document.createElement("textarea");
    output.className="inquiry-output";
    output.readOnly=true;
    output.value=(lang==="zh"?"收件人：":"To: ")+recipient+"\n"+(lang==="zh"?"主题：":"Subject: ")+subject+"\n\n"+body;
    const actions=document.createElement("div");
    actions.className="inquiry-actions";
    const open=document.createElement("a");
    open.className="button";
    open.href=mailto;
    open.textContent=lang==="zh"?"打开邮件并发送":"Open email to send";
    const copy=document.createElement("button");
    copy.className="button alt";
    copy.type="button";
    copy.textContent=lang==="zh"?"复制完整咨询":"Copy complete inquiry";
    copy.addEventListener("click",function(){copyText(output.value,copy)});
    const call=document.createElement("a");
    call.className="button phone";
    call.href="tel:"+phone;
    call.textContent=lang==="zh"?"拨打 400-877-9100":"Call China hotline";
    actions.append(open,copy,call);
    panel.append(heading,note,output,actions);
    status.append(panel);
    panel.scrollIntoView({behavior:"smooth",block:"nearest"});

    window.location.href=mailto;
  });
})();
