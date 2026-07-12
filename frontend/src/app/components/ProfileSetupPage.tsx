import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Info } from 'lucide-react';
import { GlassCard, LiquidButton, GlassInput, GlassTextarea, ProgressStepper, PillTagSelector } from './GlassUI';
import type { PageName } from './GlassUI';
import { BRAND_NAME } from '../brand';
import { HistoryCenterPanel } from './HistoryCenterPanel';
// ✅ 表单校验 + 类型
import { userProfileSchema, type ProfileFormValues } from '@/lib/validation/profileSchema';
// ✅ 数据库 repository（真正落库）
import { userProfileRepository, girlProfileRepository, questionnaireRepository } from '@/lib/db';
import { resolveOnboardingDestination } from '@/lib/onboardingFlow';
import { hasRequiredRelationshipStage } from '@/lib/profileStageValidation';
import { loadOnboardingProgress } from '@/lib/onboardingProgress';
// ✅ 全局 store：用户身份 + UI 提示
import { useUserStore, useUiStore } from '@/stores';
import type { GirlProfile, UserProfile } from '@/types'; // ✅ 添加类型导入
import { mergeProfileTags } from '@/lib/profileArchive';
import {
  getRelationshipStageLabel,
  getRelationshipStageValue,
  getUserRelationshipStatus,
  relationshipStageOptions,
  type RelationshipStageLabel,
} from '@/lib/relationshipStage';

interface ProfileSetupPageProps {
  onNavigate: (page: PageName) => void;
}

const steps = ['资料建档', '男生问卷', '女生问卷', '阶段问卷', '关系画像'];

// ✅ 年龄段按钮改为 4 档，与 schema 的 ageRange 枚举一一对齐
const ageOptions = ['18-22岁', '23-27岁', '28-32岁', '33岁以上'];
const expOptions = ['零经验', '有过暗恋', '恋爱过1次', '恋爱过多次'];
const confusionOptions = ['不知道说什么', '怕说错话', '读不懂她', '回复太慢很焦虑', '不敢推进', '不会表白'];
const styleOptions = ['话少内敛', '逗比活泼', '稳重踏实', '细腻体贴', '直接坦诚'];
const anxiousOptions = ['不太会', '偶尔焦虑', '经常焦虑', '非常焦虑'];

// ── 她的信息（本次不接库，保留为本地 state）用到的选项 ──
const freqOptions = ['每天聊', '隔天聊', '一周几次', '断断续续'];
const likeOptions = ['咖啡', '猫猫', '旅行', '音乐', '电影', '美食', '健身', '读书', '游戏', '艺术'];
const triggerOptions = ['被催促', '被忽视', '说话不算数', '敷衍回复', '爹味说教'];
const relationOptions = relationshipStageOptions.map((option) => option.label);
const interactionPreferenceOptions = ['文字聊天', '语音沟通', '线下见面', '分享日常', '需要空间'];
const invitationExperienceOptions: Array<{ label: string; value: NonNullable<GirlProfile['invitationExperience']> }> = [
  { label: '还没邀请过', value: 'not-yet' },
  { label: '接受过邀约', value: 'accepted' },
  { label: '婉拒过邀约', value: 'declined' },
  { label: '暂时看不出来', value: 'unclear' },
];
const observationSourceOptions: Array<{ label: string; value: NonNullable<GirlProfile['observationSource']> }> = [
  { label: '她明确说过', value: 'explicit' },
  { label: '聊天中提到', value: 'chat' },
  { label: '我的观察', value: 'observation' },
];

// ✅ 「界面文字 ↔ 枚举值」映射层：UI 显示中文，存库用 schema 枚举
const ageLabelToValue: Record<string, ProfileFormValues['ageRange']> = {
  '18-22岁': '18-22', '23-27岁': '23-27', '28-32岁': '28-32', '33岁以上': '33+',
};
const expLabelToValue: Record<string, ProfileFormValues['loveExperience']> = {
  '零经验': 'none', '有过暗恋': 'little', '恋爱过1次': 'some', '恋爱过多次': 'rich',
};

/** 反转映射：枚举值 → 界面文字（回填时用） */
function invert<V extends string>(m: Record<string, V>): Record<V, string> {
  const out = {} as Record<V, string>;
  for (const k in m) out[m[k]] = k;
  return out;
}
const ageValueToLabel = invert(ageLabelToValue);
const expValueToLabel = invert(expLabelToValue);

// ✅ 多选标签 ↔ 单个字符串（用「、」分隔）互转，给 mainConfusion / chatStyle 用
const splitToArr = (v?: string) => (v ? v.split('、').filter(Boolean) : []);
const toggleInString = (current: string | undefined, val: string) => {
  const arr = splitToArr(current);
  const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  return next.join('、');
};

// ✅ 是否容易焦虑：4 档界面 → boolean（经常/非常 = true）。回填时按 boolean 取代表性标签高亮
const anxiousLabelToBool: Record<string, boolean> = {
  '不太会': false, '偶尔焦虑': false, '经常焦虑': true, '非常焦虑': true,
};

export function ProfileSetupPage({ onNavigate }: ProfileSetupPageProps) {
  // ✅ 「我的信息」改由 react-hook-form 接管（删除了原来的 myNickname/myAge/... 等 useState）
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      nickname: '',
      mainConfusion: '',
      relationshipStatus: 'single',
    },
  });

  const [isReturningUser, setIsReturningUser] = useState(false);

  // ✅ 记住用户选的具体焦虑等级 label（用于正确回显）
  const [anxiousLabel, setAnxiousLabel] = useState<string | undefined>(undefined);

  // ── 「她的信息」本次不接库，保留为本地 state（与原文件一致）──
  const [herName, setHerName] = useState('');
  const [knowDuration, setKnowDuration] = useState('');
  const [relation, setRelation] = useState<string[]>([]);
  const [freq, setFreq] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [customLikes, setCustomLikes] = useState('');
  const [customTriggers, setCustomTriggers] = useState('');
  const [interactionPreferences, setInteractionPreferences] = useState<string[]>([]);
  const [invitationExperience, setInvitationExperience] = useState<GirlProfile['invitationExperience']>();
  const [observationSource, setObservationSource] = useState<GirlProfile['observationSource']>();
  const [notes, setNotes] = useState('');

  // ✅ 任务 2：女生称呼必填校验
  const [girlNameError, setGirlNameError] = useState<string | null>(null);
  const [relationError, setRelationError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // ✅ 任务 2：单选函数
  const selectSingle = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter([value]);
    if (setter === setRelation) setRelationError(null);
  };

  const toggle = (arr: string[], val: string, setArr: (a: string[]) => void) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const fillGirlProfile = (girl: GirlProfile) => {
    setHerName(girl.nickname || '');
    setKnowDuration(girl.knownDuration || '');

    setRelation([getRelationshipStageLabel(girl)]);

    const freqToLabel: Record<string, string> = {
      high: '每天聊',
      medium: '隔天聊',
      low: '断断续续',
    };
    const freqLabel = girl.interactionFrequencyLabel || freqToLabel[girl.interactionFrequency] || '隔天聊';
    setFreq([freqLabel]);

    const storedLikes = girl.likes || girl.interests || [];
    const storedTriggers = girl.tabooBehaviors || [];
    const customInterestTags = girl.customInterests || storedLikes.filter((item) => !likeOptions.includes(item));
    const customBoundaryTags = girl.customBoundaries || storedTriggers.filter((item) => !triggerOptions.includes(item));
    setLikes(storedLikes.filter((item) => likeOptions.includes(item)));
    setTriggers(storedTriggers.filter((item) => triggerOptions.includes(item)));
    setCustomLikes(customInterestTags.join('、'));
    setCustomTriggers(customBoundaryTags.join('、'));
    setInteractionPreferences(girl.interactionPreferences || []);
    setInvitationExperience(girl.invitationExperience);
    setObservationSource(girl.observationSource);
    setNotes(girl.notes || '');
  };

  const fillUserProfile = (user: UserProfile) => {
    form.reset({
      nickname: user.nickname,
      ageRange: user.ageRange,
      relationshipStatus: user.relationshipStatus,
      loveExperience: user.loveExperience,
      mainConfusion: user.mainConfusion,
      mbti: user.mbti,
      selfPersonality: user.selfPersonality,
      communicationHabit: user.communicationHabit,
      emotionExpression: user.emotionExpression,
      chatStyle: user.chatStyle,
      isAnxious: user.isAnxious,
      isProactive: user.isProactive,
    });
    setAnxiousLabel(user.isAnxious === true ? '经常焦虑' : user.isAnxious === false ? '不太会' : undefined);
  };

  // ✅ 任务 3：挂载时加载已有资料并回填表单
  useEffect(() => {
    async function loadExistingProfile() {
      console.log('🔍 [ProfileSetupPage] 开始加载已保存资料用于回显');

      await useUserStore.getState().loadCurrentUser();
      const user = useUserStore.getState().currentUser;

      if (user) {
        console.log('✅ [ProfileSetupPage] 找到 userProfile，开始回显:', user);
        fillUserProfile(user);

        console.log('✅ [ProfileSetupPage] userProfile 回显完成');
      }

      if (user?.id) {
        const girls = await girlProfileRepository.getByUserId(user.id);
        const girl = girls[0];
        if (girl) {
          console.log('✅ [ProfileSetupPage] 找到 girlProfile，开始回显:', girl);

          fillGirlProfile(girl);

          console.log('✅ [ProfileSetupPage] girlProfile 回显完成:', {
            id: girl.id,
            nickname: girl.nickname,
            updatedAt: girl.updatedAt,
          });
        } else {
          console.log('⚠️ [ProfileSetupPage] 没有找到 girlProfile');
        }
      }
    }

    loadExistingProfile();
    loadOnboardingProgress().then((progress) => setIsReturningUser(progress.isReturningUser || progress.isComplete));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 提交：校验通过后真正落库 + 更新 store + toast + 跳转
  const onSubmit = async (data: ProfileFormValues) => {
    console.log('📥 [ProfileSetupPage] onSubmit 开始，收集到的数据：');
    console.log('  - 男生表单 (userForm):', data);
    console.log('  - 女生表单 (girlForm):', {
      herName,
      knowDuration,
      relation,
      freq,
      likes,
      triggers,
      customLikes,
      customTriggers,
      interactionPreferences,
      invitationExperience,
      observationSource,
      notes,
    });

    // ✅ 任务 2：女生称呼必填校验（最优先）
    if (!herName || !herName.trim()) {
      setGirlNameError('请填写她的称呼');
      console.warn('⚠️ [ProfileSetupPage] 女生称呼为空，阻止提交');
      return;
    }

    if (!hasRequiredRelationshipStage(relation)) {
      setRelationError('请选择当前关系阶段');
      useUiStore.getState().showToast('请选择当前关系阶段', 'error');
      return;
    }

    const ui = useUiStore.getState();
    const userStore = useUserStore.getState();
    try {
      ui.showLoading('保存中...');
      const selectedRelation = relation[0] as RelationshipStageLabel;
      setSaveMessage(null);
      const synchronizedData: ProfileFormValues = {
        ...data,
        relationshipStatus: getUserRelationshipStatus(selectedRelation),
      };

      // 1. 保存男生资料
      console.log('📥 [ProfileSetupPage] 准备保存 userProfile，合并数据：', {
        existing: userStore.currentUser,
        new: synchronizedData,
      });
      const savedUser = await userProfileRepository.save({
        ...(userStore.currentUser ?? {}),
        ...synchronizedData,
      });
      console.log('✅ [ProfileSetupPage] userProfile 保存成功，user.id:', savedUser.id);

      userStore.setCurrentUser(savedUser);

      // 2. ✅ 保存女生资料（修复：之前完全没有这段代码）
      // ✅ 任务 3：在构造 girlPayload 前先记录 state
      console.log('📥 [ProfileSetupPage] 保存前 relation:', relation);
      console.log('📥 [ProfileSetupPage] 保存前 freq:', freq);

      const selectedFreq = freq[0] || '';

      console.log('📥 [ProfileSetupPage] 最终选中的关系阶段:', selectedRelation);
      console.log('📥 [ProfileSetupPage] 最终选中的联系频率:', selectedFreq);

      const freqMap: Record<string, GirlProfile['interactionFrequency']> = {
        '每天聊': 'high',
        '隔天聊': 'medium',
        '一周几次': 'medium',
        '断断续续': 'low',
      };

      const currentStage = getRelationshipStageValue(selectedRelation);
      const interactionFrequency = freqMap[selectedFreq] || 'medium';

      console.log('🔁 [ProfileSetupPage] 关系阶段最终保存映射:', {
        ui: selectedRelation,
        db: currentStage,
      });
      console.log('🔁 [ProfileSetupPage] 联系频率最终保存映射:', {
        ui: selectedFreq,
        db: interactionFrequency,
      });

      const customInterestTags = mergeProfileTags([], customLikes);
      const customBoundaryTags = mergeProfileTags([], customTriggers);
      const mergedLikes = mergeProfileTags(likes, customLikes);
      const mergedTriggers = mergeProfileTags(triggers, customTriggers);
      const girlPayload = {
        userId: savedUser.id, // ✅ 关键：绑定到刚保存的 user.id
        nickname: herName,
        ageRange: '23-27' as const, // 默认值（UI 暂未收集）
        knownChannel: '其他', // 默认值（UI 暂未收集）
        knownDuration: knowDuration || '未知',
        currentStage,
        currentStageLabel: selectedRelation || undefined, // ✅ 任务 3：保存原始 UI 标签
        interactionFrequency,
        interactionFrequencyLabel: selectedFreq || undefined, // ✅ 任务 3：保存原始 UI 标签
        interests: mergedLikes,
        likes: mergedLikes,
        tabooBehaviors: mergedTriggers,
        customInterests: customInterestTags,
        customBoundaries: customBoundaryTags,
        interactionPreferences,
        invitationExperience,
        observationSource,
        notes: notes.trim() || undefined,
      };

      // ✅ 任务 4：防止保存空女生资料（兜底检查）
      if (!girlPayload.nickname || !girlPayload.nickname.trim()) {
        console.error('❌ [ProfileSetupPage] girlPayload.nickname 为空，取消保存');
        setGirlNameError('请填写她的称呼');
        ui.hideLoading();
        return;
      }

      console.log('📥 [ProfileSetupPage] 准备保存 girlProfile:', girlPayload);
      const savedGirl = await girlProfileRepository.save(girlPayload);
      console.log('✅ [ProfileSetupPage] girlProfile 保存成功:', {
        id: savedGirl.id,
        userId: savedGirl.userId,
        nickname: savedGirl.nickname,
      });

      // ✅ 任务 4：清理重复记录
      await girlProfileRepository.cleanupDuplicatesByUserId(savedUser.id);
      console.log('🧹 [ProfileSetupPage] 已清理重复 girlProfiles');

      // 3. ✅ 立即同步 store
      await userStore.loadCurrentUser();
      console.log('✅ [ProfileSetupPage] 已同步 store，currentGirl 应为最新女生资料:', userStore.currentGirl?.id);
      console.log('✅ [ProfileSetupPage] 已同步 store，currentGirl:', userStore.currentGirl?.id);

      // ✅ 任务 1：根据 onboardingCompleted 决定跳转
      if (isReturningUser) {
        console.log('✅ [ProfileSetupPage] 老用户资料保存成功，停留当前页，不跳转问卷');
        ui.showToast('资料已保存', 'success');
        setSaveMessage('资料已保存，关系阶段和资料内容已更新');
        ui.hideLoading();
        return;
      }

      // ✅ 新手引导阶段：只跳到缺失的下一步
      const maleQ = await questionnaireRepository.getLatestMale(savedUser.id);
      const femaleQ = await questionnaireRepository.getLatestFemale(savedUser.id);

      if (!maleQ) {
        console.log('🔀 [ProfileSetupPage] 新手引导：未完成男生问卷，跳转 male-questionnaire');
        ui.showToast('资料已保存', 'success');
        setSaveMessage('资料已保存，正在进入男生问卷');
        onNavigate('male-questionnaire');
        return;
      }

      if (!femaleQ || !femaleQ.girlId) {
        console.log('🔀 [ProfileSetupPage] 新手引导：未完成女生问卷，跳转 female-questionnaire');
        ui.showToast('资料已保存', 'success');
        setSaveMessage('资料已保存，正在进入女生问卷');
        onNavigate('female-questionnaire');
        return;
      }

      const nextPage = resolveOnboardingDestination({
        hasUser: true,
        hasGirl: true,
        hasMaleQuestionnaire: !!maleQ,
        hasFemaleQuestionnaire: !!femaleQ.girlId,
        onboardingCompleted: false,
      });
      console.log(`🔀 [ProfileSetupPage] 新手引导：问卷已完成，跳转 ${nextPage}`);
      ui.showToast('资料已保存', 'success');
      setSaveMessage('资料已保存，正在进入阶段专项问卷');
      if (nextPage === 'stage-questionnaires') onNavigate(nextPage);
    } catch (e) {
      console.error('❌ [ProfileSetupPage] 保存失败:', e);
      setSaveMessage('保存失败，请检查填写内容后重试');
      ui.showToast('保存失败：' + (e as Error).message, 'error');
    } finally {
      ui.hideLoading();
    }
  };

  const actionBar = (
    <div
      className="profile-actionbar"
      style={{
        gridColumn: '1 / -1',
        marginTop: 16,
        padding: '18px 24px',
        background: 'rgba(255,245,248,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 20,
        display: 'flex',
        gap: 12,
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 180 }}>
        <Info size={14} color="var(--text-purple)" style={{ opacity: 0.6 }} />
        <span style={{ fontSize: 12, color: saveMessage ? '#4A9E6A' : 'var(--text-purple)', opacity: 0.8 }}>{saveMessage || '填写越完整，AI 分析越准确'}</span>
      </div>
      <LiquidButton onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting}>
        {isReturningUser ? '保存资料' : '保存并继续'}
        {!isReturningUser && <ArrowRight size={16} />}
      </LiquidButton>
    </div>
  );

  const errors = form.formState.errors;

  return (
    <div style={{ padding: '32px 32px 40px', maxWidth: 960, margin: '0 auto' }} className="page-enter">
      {/* Stepper */}
      <GlassCard hover={false} style={{ marginBottom: 32 }} padding="20px 24px">
        <ProgressStepper steps={steps} current={0} />
      </GlassCard>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: 'var(--text-rose)', letterSpacing: '-0.03em' }}>
          资料建档
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-purple)', opacity: 0.75 }}>
          信息越准确，AI 分析越贴近真实情况；但不要填写未经允许的敏感隐私。
        </p>
      </div>

      {/* ✅ 欢迎卡片：仅新用户首次显示 */}
      {!isReturningUser && (
        <GlassCard className="mb-6" style={{ marginBottom: 24 }} padding="20px">
          <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>👋</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--pink-primary)', marginBottom: 8, marginTop: 0 }}>先来做一份你的小档案吧</h3>
              <p style={{ fontSize: 14, color: 'var(--text-rose)', lineHeight: 1.6, marginBottom: 10, marginTop: 0 }}>
                接下来会用几步帮你建立关系画像：填资料 → 做两份问卷 → 生成关系画像。大约 3 分钟。
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-purple)', opacity: 0.75, lineHeight: 1.65, marginTop: 0, marginBottom: 0 }}>
                🔒 所有信息优先保存在你的浏览器本地，你可以随时清空。
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* THE GRID wraps BOTH cards AND the notice — notice uses grid-column: 1/-1 to span full width */}
      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* 我的信息 */}
        <GlassCard className="hoverable-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#E8748A,#C5956C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 16 }}>👤</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-rose)' }}>我的信息</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* ✅ 昵称：GlassInput 用自定义 onChange，故用 Controller 绑定 */}
            <div>
              <Controller
                name="nickname"
                control={form.control}
                render={({ field }) => (
                  <GlassInput label="昵称（可以不用真名）" placeholder="叫我什么都行" value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
              {errors.nickname && (
                <p className="text-red-500 text-sm mt-1" style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.nickname.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>年龄段</label>
              {/* ✅ PillTagSelector 单选，用 Controller；界面文字↔枚举值 通过映射转换 */}
              <Controller
                name="ageRange"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={ageOptions}
                    selected={field.value ? [ageValueToLabel[field.value]] : []}
                    onToggle={(label) => field.onChange(ageLabelToValue[label])}
                  />
                )}
              />
              {errors.ageRange && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.ageRange.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>恋爱经验</label>
              <Controller
                name="loveExperience"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={expOptions}
                    selected={field.value ? [expValueToLabel[field.value]] : []}
                    onToggle={(label) => field.onChange(expLabelToValue[label])}
                  />
                )}
              />
              {errors.loveExperience && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.loveExperience.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>主要困惑（可多选）</label>
              {/* ✅ 多选：拼成「、」分隔字符串存 mainConfusion */}
              <Controller
                name="mainConfusion"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={confusionOptions}
                    selected={splitToArr(field.value)}
                    onToggle={(v) => field.onChange(toggleInString(field.value, v))}
                  />
                )}
              />
              {errors.mainConfusion && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>{errors.mainConfusion.message}</p>
              )}
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>沟通风格</label>
              {/* ✅ 多选：拼成字符串存 chatStyle（可选） */}
              <Controller
                name="chatStyle"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={styleOptions}
                    selected={splitToArr(field.value)}
                    onToggle={(v) => field.onChange(toggleInString(field.value, v))}
                  />
                )}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>是否容易焦虑</label>
              {/* ✅ 用 state 记住用户选的具体 label，点击时：若再次点击已选项则清空（undefined），否则更新 */}
              <Controller
                name="isAnxious"
                control={form.control}
                render={({ field }) => (
                  <PillTagSelector
                    options={anxiousOptions}
                    selected={anxiousLabel ? [anxiousLabel] : []}
                    onToggle={(label) => {
                      // 如果点击的是当前已选项 → 取消选择（变成 undefined）
                      if (anxiousLabel === label) {
                        setAnxiousLabel(undefined);
                        field.onChange(undefined);
                      } else {
                        // 否则 → 记住新 label + 转换成 boolean 存 RHF
                        setAnxiousLabel(label);
                        field.onChange(anxiousLabelToBool[label]);
                      }
                    }}
                  />
                )}
              />
            </div>
          </div>
        </GlassCard>

        {/* 她的信息 */}
        <GlassCard className="hoverable-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#D4A5C9,#E8748A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 16 }}>🌸</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-rose)' }}>她的信息</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <GlassInput
                label="称呼（你对她的叫法）"
                placeholder="例如：小林、阿雅"
                value={herName}
                onChange={(v) => {
                  setHerName(v);
                  // ✅ 任务 2：输入时清除错误
                  if (v && v.trim()) {
                    setGirlNameError(null);
                  }
                }}
              />
              {/* ✅ 任务 2：显示红色错误提示 */}
              {girlNameError && (
                <p style={{ color: '#e5484d', fontSize: 13, margin: '6px 0 0', paddingLeft: 4 }}>
                  {girlNameError}
                </p>
              )}
            </div>
            <GlassInput label="认识时长" placeholder="例如：3个月、半年" value={knowDuration} onChange={setKnowDuration} />

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>我和她的关系阶段</label>
              <PillTagSelector
                options={relationOptions}
                selected={relation}
                onToggle={(v: string) => {
                  selectSingle(v, setRelation);
                }}
              />
              {relationError && (
                <p style={{ margin: '7px 4px 0', fontSize: 13, color: '#e5484d' }}>{relationError}</p>
              )}
              <p style={{ margin: '8px 4px 0', fontSize: 12, color: 'var(--text-purple)', opacity: 0.66, lineHeight: 1.6 }}>
                必须选择一个阶段；保存后，关系画像和 AI 建议都会以这里的阶段为准。
              </p>
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>联系频率</label>
              <PillTagSelector
                options={freqOptions}
                selected={freq}
                onToggle={(v: string) => {
                  selectSingle(v, setFreq);
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>喜欢与兴趣（已知的）</label>
              <PillTagSelector options={likeOptions} selected={likes} onToggle={v => toggle(likes, v, setLikes)} />
              <GlassInput label="补充兴趣或偏好" placeholder="例如：看展、手帐、城市漫步" value={customLikes} onChange={setCustomLikes} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>雷点（她明确表达过的）</label>
              <PillTagSelector options={triggerOptions} selected={triggers} onToggle={v => toggle(triggers, v, setTriggers)} />
              <GlassInput label="补充边界或雷点" placeholder="例如：不喜欢临时改约、不吃香菜" value={customTriggers} onChange={setCustomTriggers} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>她更舒服的互动方式（基于观察）</label>
              <PillTagSelector options={interactionPreferenceOptions} selected={interactionPreferences} onToggle={v => toggle(interactionPreferences, v, setInteractionPreferences)} />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>邀约情况</label>
              <PillTagSelector
                options={invitationExperienceOptions.map((option) => option.label)}
                selected={invitationExperience ? [invitationExperienceOptions.find((option) => option.value === invitationExperience)?.label || ''] : []}
                onToggle={(label) => setInvitationExperience(invitationExperienceOptions.find((option) => option.label === label)?.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-purple)', fontWeight: 500, display: 'block', marginBottom: 8, paddingLeft: 4 }}>补充信息来自哪里</label>
              <PillTagSelector
                options={observationSourceOptions.map((option) => option.label)}
                selected={observationSource ? [observationSourceOptions.find((option) => option.value === observationSource)?.label || ''] : []}
                onToggle={(label) => setObservationSource(observationSourceOptions.find((option) => option.label === label)?.value)}
              />
            </div>

            <GlassTextarea label="备注" placeholder="其他想记录的信息..." value={notes} onChange={setNotes} rows={3} />
          </div>
        </GlassCard>

        {actionBar}

        {/* Notice — grid-column: 1/-1 spans both cards exactly, INSIDE the grid */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="privacy-notice" style={{
            borderRadius: 20, padding: '16px 22px',
            display: 'flex', gap: 12, alignItems: 'center',
            boxShadow: '0 4px 24px rgba(196,160,112,0.12), inset 0 1px 0 rgba(255,255,255,0.65)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,rgba(196,160,112,0.2),rgba(255,248,240,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(196,160,112,0.25)' }}>
              <span style={{ fontSize: 18 }}>🔒</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--champagne-gold)', marginBottom: 3 }}>隐私说明 · {BRAND_NAME}</div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--graphite-rose)', lineHeight: 1.65 }}>
                本页信息仅用于优化 AI 分析结果，优先存储在本地，随时可清空。信息越准确，AI 分析越贴近真实情况；但不要填写未经允许的敏感隐私。
              </p>
            </div>
          </div>
        </div>
      </div>{/* end grid */}

      <GlassCard style={{ marginTop: 24 }} padding="20px 24px">
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 6 }}>资料会如何帮助你</div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7, opacity: 0.8 }}>
          这份追求期资料会作为关系画像、聊天分析、回复建议和模拟对话的参考。追求期包含初识接触、升温和暧昧观察三个阶段。她明确说过的信息优先级更高；你的观察只会作为辅助参考，不会被当成事实。重要日子请在“重要日子”页面单独维护。
        </p>
      </GlassCard>

      <GlassCard style={{ marginTop: 16 }} padding="20px 24px">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-rose)', marginBottom: 6 }}>阶段专项问卷</div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-purple)', lineHeight: 1.7, opacity: 0.8 }}>
              追求期会分开了解你自己、互动事实与关系节奏；不会用一套题覆盖所有时期。
            </p>
          </div>
          <LiquidButton
            variant="secondary"
            disabled={!hasRequiredRelationshipStage(relation)}
            onClick={() => {
              if (!hasRequiredRelationshipStage(relation)) {
                useUiStore.getState().showToast('请先选择当前关系阶段', 'error');
                return;
              }
              onNavigate('stage-questionnaires');
            }}
          >
            查看专项问卷 <ArrowRight size={16} />
          </LiquidButton>
        </div>
      </GlassCard>

      {/* ✅ 老用户模式：重做问卷按钮 */}
      {isReturningUser && (
        <div style={{ marginTop: 24, padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,245,248,0.5)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-purple)', opacity: 0.75, marginBottom: 12 }}>
            想更新关系画像？可以重新填写问卷
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <LiquidButton
              variant="secondary"
              onClick={() => onNavigate('male-questionnaire')}
              style={{ flex: 1 }}
            >
              重新填写男生问卷
            </LiquidButton>
            <LiquidButton
              variant="secondary"
              onClick={() => onNavigate('female-questionnaire')}
              style={{ flex: 1 }}
            >
              重新填写女生问卷
            </LiquidButton>
          </div>
        </div>
      )}

      {/* 历史中心 */}
      {isReturningUser && (
        <div style={{ marginTop: 28, padding: '0 32px 40px' }}>
          <HistoryCenterPanel onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}
