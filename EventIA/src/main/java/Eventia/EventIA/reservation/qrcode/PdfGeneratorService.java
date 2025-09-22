package Eventia.EventIA.reservation.qrcode;


import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

@Service
public class PdfGeneratorService {



    public byte[] genererBilletPdf(String html) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // Propriétés pour gérer encodage, CSS, etc.
            ConverterProperties props = new ConverterProperties();
            props.setCharset(StandardCharsets.UTF_8.name());

            // Conversion HTML → PDF
            HtmlConverter.convertToPdf(html, baos, props);

            return baos.toByteArray(); // Retourne le PDF en bytes
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
