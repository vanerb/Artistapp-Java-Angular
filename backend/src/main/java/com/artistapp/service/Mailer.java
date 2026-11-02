package com.artistapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/** Envía correos por SMTP si MAIL_HOST está configurado; si no, los escribe en el log (MAIL_MAILER=log). */
@Service
public class Mailer {
    private static final Logger log = LoggerFactory.getLogger(Mailer.class);
    private final ObjectProvider<JavaMailSender> sender;
    private final String host;
    private final String from;

    public Mailer(ObjectProvider<JavaMailSender> sender, @Value("${spring.mail.host:}") String host, @Value("${artistapp.mail.from}") String from) {
        this.sender = sender;
        this.host = host;
        this.from = from;
    }

    public void send(String to, String subject, String body) {
        JavaMailSender mail = sender.getIfAvailable();
        if (host == null || host.isBlank() || mail == null) {
            log.info("Correo para {} — {}\n{}", to, subject, body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mail.send(message);
    }
}
