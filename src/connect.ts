import isIpAddress from "is-ip";
import isValidDomain from "is-valid-domain";

/*
> <value> can have the following values:
>
>   • domains like "tampermonkey.net" (this will also allow all sub-domains)
>   • sub-domains i.e. "safari.tampermonkey.net"
>   • "self" to whitelist the domain the script is currently running at
>   • "localhost" to access the localhost
>   • "1.2.3.4" to connect to an IP address
>   • "*"
>
👉 https://www.tampermonkey.net/documentation.php#_connect
*/

const CONNECT_KEYWORDS = [ "self", "localhost", "*" ];

export function isValidConnectValue(v: string): boolean {
    return CONNECT_KEYWORDS.includes(v) || isValidDomain(v) || isIpAddress(v);
}

export const validConnectValueRequired = `Value must be a domain (e.g. example.com), an IP address (e.g. 1.2.3.4), or one of ${CONNECT_KEYWORDS.map(x => `"${x}"`).join(", ")}.`;
