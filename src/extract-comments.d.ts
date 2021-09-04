declare module "extract-comments" {
    export default function(s: string): ReadonlyArray<Comment>
}

interface Comment {
    type: "LineComment" | "BlockComment"
    value: string
    raw: string
}
