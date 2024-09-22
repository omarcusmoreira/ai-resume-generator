export function trimToJSON(completion: string): string {
    const jsonMatch = completion.match(/{[\s\S]*}/);
    return jsonMatch ? jsonMatch[0] : '';
}