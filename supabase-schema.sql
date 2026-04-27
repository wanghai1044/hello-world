-- =====================================================
-- CPA题库系统 - Supabase 数据库结构
-- =====================================================

-- 1. 用户表（使用 Supabase Auth 的同时创建扩展表）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 题目表
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    chapter TEXT DEFAULT '',
    type TEXT DEFAULT '单选题',
    difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
    question TEXT NOT NULL,
    option_a TEXT DEFAULT '',
    option_b TEXT DEFAULT '',
    option_c TEXT DEFAULT '',
    option_d TEXT DEFAULT '',
    option_e TEXT DEFAULT '',
    correct_answer TEXT NOT NULL,
    explanation TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 答题记录表
CREATE TABLE IF NOT EXISTS answer_records (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 用户收藏/错题表
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    is_wrong BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- =====================================================
-- 行级安全策略 (RLS)
-- =====================================================

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- user_profiles 策略：用户只能查看和修改自己的资料
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- questions 策略：所有人可查看题目，只有管理员可修改
CREATE POLICY "Anyone can view questions" ON questions
    FOR SELECT USING (true);
CREATE POLICY "Anyone can insert questions" ON questions
    FOR INSERT WITH CHECK (true);

-- answer_records 策略：用户只能查看自己的答题记录
CREATE POLICY "Users can view own records" ON answer_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON answer_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_favorites 策略：用户只能操作自己的收藏
CREATE POLICY "Users can view own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 自动触发器：创建用户时自动创建用户资料
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, display_name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 初始数据：示例题目
-- =====================================================

INSERT INTO questions (subject, chapter, type, difficulty, question, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
('会计', '第一章 总论', '单选题', 1, '下列关于会计基本假设的表述中，正确的是？', '会计主体确定了会计核算的空间范围', '持续经营明确了会计核算的时间范围', '会计分期是持续经营的前提', '货币计量为会计核算提供了必要手段', 'A', '会计主体确定了会计核算的空间范围，持续经营明确了会计核算的时间范围，会计分期是持续经营的补充，货币计量为会计核算提供了必要手段。'),
('会计', '第一章 总论', '多选题', 2, '下列各项中，属于会计信息质量要求的有？', '可靠性', '相关性', '可理解性', '可比性', 'ABCD', '会计信息质量要求包括：可靠性、相关性、可理解性、可比性、实质重于形式、重要性、谨慎性和及时性。'),
('审计', '第一章 审计概述', '单选题', 1, '下列关于审计证据的表述中，正确的是？', '审计证据仅包括会计记录和其他信息', '审计证据的适当性影响其充分性', '审计证据的充分性影响其适当性', '审计证据的获取需要考虑成本效益原则', 'B', '审计证据的适当性会影响其充分性，但充分性不会影响适当性。'),
('财务成本管理', '第一章 财务管理基本原理', '计算题', 3, '某公司拟进行一项投资，初始投资额为100万元，预计未来5年每年的现金净流量为30万元，假设折现率为10%，要求计算该项目的净现值（P/A，10%，5=3.7908）。', '13.72万元', '15.72万元', '16.72万元', '17.72万元', 'A', '净现值 = 30×(P/A,10%,5) - 100 = 30×3.7908 - 100 = 113.724 - 100 = 13.724万元'),
('税法', '第一章 税法总论', '单选题', 1, '下列税种中，属于中央与地方共享税的是？', '消费税', '个人所得税', '关税', '土地增值税', 'B', '个人所得税属于中央与地方共享税，消费税和关税属于中央税，土地增值税属于地方税。');

-- =====================================================
-- 索引优化
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_answer_records_user_id ON answer_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
