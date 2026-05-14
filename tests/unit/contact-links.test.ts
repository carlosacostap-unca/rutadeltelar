import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getActorSocialLinks } from "../../app/lib/contact-links.ts";

describe("actor social links", () => {
  it("builds populated actor social and web links with external attributes", () => {
    const links = getActorSocialLinks({
      facebook_url: " https://facebook.com/ruta ",
      instagram_url: "https://instagram.com/ruta",
      pagina_web_url: "https://rutadeltelar.example",
    });

    assert.deepEqual(links, [
      {
        label: "Facebook",
        href: "https://facebook.com/ruta",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        label: "Instagram",
        href: "https://instagram.com/ruta",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        label: "Página web",
        href: "https://rutadeltelar.example",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ]);
  });

  it("omits empty social and web fields", () => {
    assert.deepEqual(
      getActorSocialLinks({
        facebook_url: "",
        instagram_url: "   ",
        pagina_web_url: undefined,
      }),
      [],
    );
  });

  it("keeps partial actor social links without empty placeholders", () => {
    assert.deepEqual(getActorSocialLinks({ instagram_url: "https://instagram.com/ruta" }), [
      {
        label: "Instagram",
        href: "https://instagram.com/ruta",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ]);
  });
});
