import lang from '../language.json'

export const SetTitle = (Language, Page) => {
    const LangData = lang.contents.find(c => c.lang === Language);
    if (LangData == null) return SetTitle(lang.default);
    const SubTitle = LangData.subtitles.find(s => s.page === Page);
    document.title = SubTitle == null ? LangData.title : (`${SubTitle.text} - ${LangData.title}`);
};
