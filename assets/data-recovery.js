(function(){
  "use strict";

  const recipient="1175365450@qq.com";
  const params=new URLSearchParams(location.search);
  const lang=document.documentElement.lang.startsWith("zh")?"zh":"en";

  document.querySelectorAll("[data-copy]").forEach(function(button){
    button.addEventListener("click",async function(){
      const old=button.textContent;
      try{
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent=lang==="zh"?"已复制":"Copied";
      }catch(error){
        button.textContent=lang==="zh"?"请手动复制":"Copy manually";
      }
      setTimeout(function(){button.textContent=old},1600);
    });
  });

  const form=document.querySelector("#inquiryForm");
  if(!form)return;

  form.addEventListener("submit",function(event){
    event.preventDefault();
    const status=document.querySelector("#formStatus");
    const data=Object.fromEntries(new FormData(form));

    if(data.website){
      status.textContent=lang==="zh"?"无法处理此提交。":"This submission could not be processed.";
      return;
    }

    const source=[
      "utm_source="+(params.get("utm_source")||"direct"),
      "utm_medium="+(params.get("utm_medium")||"none"),
      "utm_campaign="+(params.get("utm_campaign")||"none"),
      "page="+location.href.split("#")[0]
    ].join("\n");

    const subject=lang==="zh"?"数据恢复咨询 - "+data.name:"Data recovery inquiry - "+data.name;
    const body=lang==="zh"
      ?["称呼："+data.name,"联系方式："+data.contact,"公司："+(data.company||"未填写"),"","设备和故障信息：",data.request,"","来源：",source].join("\n")
      :["Name: "+data.name,"Phone or email: "+data.contact,"Company: "+(data.company||"Not provided"),"","Device and symptoms:",data.request,"","Source:",source].join("\n");
    const mailto="mailto:"+recipient+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);

    status.textContent=lang==="zh"
      ?"本站未保存你的信息。已生成咨询邮件；如果邮件应用没有自动打开，请点击 "
      :"This site did not store your information. Your inquiry email is ready; if your mail app did not open, click ";
    const link=document.createElement("a");
    link.href=mailto;
    link.textContent=lang==="zh"?"打开邮件":"open the email";
    status.appendChild(link);
    status.appendChild(document.createTextNode(lang==="zh"?"。":"."));

    window.location.href=mailto;
  });
})();
