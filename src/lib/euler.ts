import md5 from 'md5';
import {match, P} from "ts-pattern";

export class ParseError extends Error {
    public readonly lines: string[];

    public constructor(message: string, lines: string[]) {
        super(message);
        this.lines = lines;
    }
}

export class EulerProblem {
    public readonly title: string;
    public readonly description: string;
    public readonly answerMd5Hashed: string;

    public constructor(params: {
        title: string,
        description: string,
        answerMd5Hashed: string,
    }) {
        this.title = params.title;
        this.description = params.description;
        this.answerMd5Hashed = params.answerMd5Hashed;
    }

    /**
     * @throws RangeError if problem has no known answer
     */
    public checkAnswer(answer: string): boolean {
        // no answer check
        if (this.answerMd5Hashed === "?") {
            throw new RangeError("This problem has no known answer!");
        }
        return md5(answer) as string === this.answerMd5Hashed;
    }

    /**
     * @throws ParseError if paragraph has unexpected schema
     */
    public static fromParagraph(paragraph: string[] | string): EulerProblem {
        return match(paragraph)
            .with(P.string, (paragraph) => EulerProblem.fromParagraph(paragraph.split(/\r?\n/)))
            .with(P.array(P.string), (lines) => {
                // header check
                if (lines[0]?.startsWith("Problem") !== true ||
                    lines[1]?.startsWith("=") !== true
                ) {
                    throw new ParseError("Invalid paragraph syntax (wrong header)!", lines)
                }

                let descriptionStartingLine: number | undefined;
                for (let i = 2; i < lines.length; ++i) {
                    descriptionStartingLine = i;
                    if (lines[i]!.trim().length > 0) {
                        break;
                    }
                }
                if (descriptionStartingLine === undefined) {
                    throw new ParseError("Invalid paragraph syntax (no description)!", lines);
                }

                let answerLine: number | undefined = undefined;
                for (const i in lines) {
                    const line = lines[i];
                    if (line === undefined) {
                        break;
                    }
                    if (line.trimStart().startsWith("Answer: ")) {
                        answerLine = parseInt(i);
                        break;
                    }
                }
                if (answerLine === undefined) {
                    throw new ParseError("Invalid paragraph syntax (no answer statement)!", lines);
                }

                let descriptionEndingLine = answerLine;
                while (lines[descriptionEndingLine - 1]!.trim().length === 0) {
                    --descriptionEndingLine;
                }

                const title = lines[0];
                const description = lines.slice(descriptionStartingLine, descriptionEndingLine).join("\n");
                const answerMd5Hashed = lines[answerLine]!.trimStart().substring("Answer: ".length);

                return new EulerProblem({
                    title,
                    description,
                    answerMd5Hashed
                });
            })
            .exhaustive();
    }
}

/**
 * @throws ParseError if text scheme does not match
 */
export function parseProblemsTxt(textContent: string | string[]): EulerProblem[] {
    return match(textContent)
        .with(P.string, it => parseProblemsTxt(it.split(/\r?\n/)))
        .with(P.array(P.string), (lines) => {
            const result: EulerProblem[] = [];

            let i = 0;
            while (i < lines.length) {
                if (lines[i]!.startsWith("Problem")) {
                    const paragraph: string[] = [];
                    do {
                        paragraph.push(lines[i]!);
                        i++;
                    } while (i < lines.length && !lines[i]!.startsWith("Problem"));

                    result.push(EulerProblem.fromParagraph(paragraph));
                } else {
                    i++;
                }
            }

            return result;
        })
        .exhaustive();
}
