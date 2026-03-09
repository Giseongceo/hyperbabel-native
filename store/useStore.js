import { create } from 'zustand';

export const useStore = create((set) => ({
  userLang: 'Korean',
  setUserLang: (lang) => set({ userLang: lang }),
  
  messages: [
    { 
      id: '1', 
      text: 'Hello, welcome to HyperBabel! What language do you speak?', 
      sender: 'other', 
      ogLang: 'English', 
      translations: { 
        Korean: '안녕하세요, 하이퍼바벨에 오신 것을 환영합니다! 어떤 언어를 사용하시나요?' 
      } 
    }
  ],
  
  addMessage: (text, sender, ogLang) => set((state) => ({ 
    messages: [...state.messages, {
      id: Date.now().toString(),
      text,
      sender,
      ogLang,
      translations: {
        English: `[EN: ${text}]`,
        Korean: `[KR: ${text}]`,
        Spanish: `[ES: ${text}]`
      }
    }] 
  })),

  receiveSocketMessage: (msgData) => set((state) => ({
    messages: [...state.messages, msgData]
  }))
}));
