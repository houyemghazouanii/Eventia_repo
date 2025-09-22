package Eventia.EventIA.Ticket;


import lombok.Data;

import java.util.Map;

@Data
public class ApplyTemplateRequest {
    private Long templateId;
    private Map<String, String> params; // ex: {"bgColor":"#fff","textColor":"#111"}
}
