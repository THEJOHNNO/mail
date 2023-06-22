document.addEventListener("DOMContentLoaded", function() {

// Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
                          //if there is no arguments to pass in for function, call function without ()
                          //single eventListener for single paged javascript app. Otherwise, emails will start duplicating.
  document.querySelector("#compose-form").addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  document.querySelector("#compose-response-heading").innerText= "New Email";

  document.querySelector("#archive-button").style.display = "none";
  document.querySelector("#unarchive-button").style.display = "none";
  document.querySelector("#respond-button").style.display = "none";

  document.querySelector("#message").innerHTML = "";
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

};

function send_email(event) {
  document.querySelector("#archive-button").style.display = "none";
  document.querySelector("#unarchive-button").style.display = "none";
  document.querySelector("#respond-button").style.display = "none";


// use the event.preventDefault(); to prevent the page from going to the normal route
    event.preventDefault();
    fetch("/emails", {
        method: "POST",
        body: JSON.stringify({
                            //use # identifiers for id's!!!
            recipients: document.querySelector("#compose-recipients").value,
            subject: document.querySelector("#compose-subject").value,
            body: document.querySelector("#compose-body").value
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        // Load mailbox within promise!!!
        load_mailbox("sent");
    })
}

function load_mailbox(mailbox) {

  document.querySelector("#archive-button").style.display = "none";
  document.querySelector("#unarchive-button").style.display = "none";
  document.querySelector("#respond-button").style.display = "none";


  document.querySelector("#archive-button").style.display = "none";
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((mail) => {
        if (mailbox != "sent") {
          fromTo = "from";
          senderOrRecipients = mail.sender;
        } else {
          fromTo = "to";
          senderOrRecipients = mail.recipients;
        };

        var mailContainer = document.createElement("div");
        mailContainer.style.border = "thin solid #F0F0F0";
        mailContainer.style.cursor = "pointer";
        mailContainer.style.marginBottom = "7px";
        mailContainer.style.paddingLeft = "5px";
        mailContainer.style.paddingTop = "4px";
        mailContainer.style.paddingBottom = "4px";

        if (mail.read) {
          mailContainer.style.backgroundColor = "#F0F0F0";
        } else {
          mailContainer.style.backgroundColor = "#ffffff";
        };

        mailContainer.innerHTML = `Subject: ${mail.subject} &nbsp;&nbsp;|&nbsp;&nbsp; ${fromTo}: ${senderOrRecipients} &nbsp;&nbsp;|&nbsp;&nbsp; ${mail.timestamp}<br>`;
        console.log(mail);
        document.querySelector("#emails-view").appendChild(mailContainer);


        var emailId = mail.id;

        mailContainer.onclick = function() {

          fetch(`/emails/${emailId}`, {
            method: 'PUT',
            body: JSON.stringify({
              read: true
              })
           })
            view_email(mail, mailbox);
        };
    });
  });
}

function view_email(mail, mailbox) {
  // Show the mailbox and hide other views

  let emailSubject = mail.subject;
  let emailBody = mail.body;
  let mailArchived = mail.archived;

  emailBody = emailBody.replace(/.{107}/g, '$&\n')

  let fromOrTo = "";
  let sOrR = mail.sender;
  let emailIdForArchive = mail.id;

  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3 style="display-inline-block;">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>

                                                      <div style="width: 100%; border: thin solid #D3D3D3; padding: 5px 8px 2px 8px;"><h6 style="display:inline-block;">

                                                      Subject: </h6><span> ${emailSubject.charAt(0).toUpperCase() + emailSubject.slice(1)}</span><br>

                                                      <h6 style="display:inline-block;">From: </h6><span> ${mail.sender}</span><br>

                                                      <h6 style="display:inline-block;">To: </h6><span> ${mail.recipients}</span><br>

                                                      <h6 style="display:inline-block;">Timestamp: </h6><span> ${mail.timestamp} </span></div>`;

  let lineBreak = document.createElement("br");
  document.querySelector("#emails-view").appendChild(lineBreak);

  let mailBodyContainer = document.createElement("div");
  mailBodyContainer.style.width = "100%";

  mailBodyContainer.innerText = emailBody;

  mailBodyContainer.style.border = "thin solid #D3D3D3";
  mailBodyContainer.style.padding = "7px 10px 7px 10px";

  document.querySelector("#emails-view").appendChild(mailBodyContainer);

  if (mailbox != "inbox") {
    document.querySelector("#archive-button").style.display = "none";
  } else if (mailbox == "inbox") {
    document.querySelector("#archive-button").style.display = "block";
  };

  document.querySelector("#archive-button").onclick = function() {
    fetch(`/emails/${emailIdForArchive}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    location.reload();
  }

  if (mailbox == "archive") {
    document.querySelector("#unarchive-button").style.display = "block";
  } else {
    document.querySelector("#unarchive-button").style.display = "none";
  };

  document.querySelector("#unarchive-button").onclick = function() {
    fetch(`/emails/${emailIdForArchive}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    location.reload();
  }

  if (mailbox == "inbox") {
    document.querySelector("#respond-button").style.display = "block";
    document.querySelector("#respond-button").onclick = function() {
      compose_response(mail);
    }
  } else {
    document.querySelector("#respond-button").style.display = "none";
  };
}


function compose_response(mail) {

  let subject = mail.subject;
  let recipients = mail.sender;
  let body = mail.body;
  let timestamp = mail.timestamp;

  let bodyInjection = `On ${timestamp} ${recipients} wrote: \n\n${body}`;

  let subjectInjection = "";

  if (subject.includes("Re:")) {
    subjectInjection = subject;
  } else {
    rE = "Re: ";
    subjectInjection = rE.concat(subject);
  }

  document.querySelector("#archive-button").style.display = "none";
  document.querySelector("#unarchive-button").style.display = "none";
  document.querySelector("#respond-button").style.display = "none";


  document.querySelector("#message").innerHTML = "";
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = recipients;
  document.querySelector("#compose-subject").value = subjectInjection;
  document.querySelector("#compose-body").value = bodyInjection;

  document.querySelector("#compose-response-heading").innerText= "Reply";

};
































//
