export function withWrapper(wrapper) {
    return {
        find: (selector) => ({
            withText: (str) => wrapper.findAll(selector).filter(i => i.text().match(str)).at(0),
            havingText: (str) => wrapper.findAll(selector).filter(i => i.text().indexOf(str) >= 0).at(0)
        }),
        areVisible: () => wrapper.findAll(selector).wrappers.filter(w => w.isVisible()).length,
        areHidden: () => wrapper.findAll(selector).wrappers.filter(w => !w.isVisible()).length,
        areAllVisible: () => wrapper.findAll(selector).wrappers.every(w => w.isVisible()),
        areAllHidden: () => wrapper.findAll(selector).wrappers.every(w => !w.isVisible()),
    }
}