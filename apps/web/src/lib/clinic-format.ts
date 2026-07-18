const LANG_LABELS: Record<string, string> = {
	EN: "English",
	ZH: "中文",
	JA: "日本語",
	KO: "한국어",
};

export function langLabel(code: string): string {
	return LANG_LABELS[code] ?? code;
}

// "PLASTIC_SURGERY" -> "Plastic Surgery"
export function titleCaseEnum(value: string): string {
	return value
		.split("_")
		.map((word) => word[0] + word.slice(1).toLowerCase())
		.join(" ");
}
