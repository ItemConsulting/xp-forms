export type Form = import("./form").Form;

declare global {
  namespace XP {
    interface ContentTypes {
      "no.item.forms:form": Form;
    }
  }
}
